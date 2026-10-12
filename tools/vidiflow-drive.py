#!/usr/bin/env python
"""
Google Drive connector for Hermes — read/write Drive from any bot, no browser OAuth dance.

WHY THIS EXISTS
  James asked: "I don't really care how, we just need to be able to read and write
  to Google Drive." The bundled google-workspace skill requires an interactive OAuth
  consent flow and a client_secret JSON downloaded from the Google Cloud console.
  That is a console task tied to one human, and it breaks the moment a sub-agent runs
  unattended. This script is the connector: one command, credentials from the Hermes
  .env, loud failure instead of a silent no-op.

AUTH MODEL (service account, default — the right choice for a fleet)
  A service account is a machine identity. You create it once in the GCP console,
  drop its JSON into .env, and every bot on every box can read/write with no per-bot
  OAuth and no consent screen. THIS IS THE KEY GOTCHA: a brand-new service account
  has its OWN empty Drive and CANNOT see your personal files. You must share the
  target folder with the service account's address (…@<project>.iam.gserviceaccount.com)
  as a Content Manager. Skipping that share is the single most common reason
  "it authenticates fine but uploads nothing".

WHEN TO USE OAUTH INSTEAD
  OAuth is fine when Drive must act as James personally, or when the account has
  Advanced Protection / a Workspace policy that blocks service accounts. Then use the
  google-workspace skill (setup.py) and this script's --oauth-token mode.

Usage:
  python vidiflow-drive.py --list
  python vidiflow-drive.py --upload C:/path/file.pdf --name "Report.pdf"
  python vidiflow-drive.py --upload f.pdf --folder <FOLDER_ID> --name "f.pdf"
  python vidiflow-drive.py --upload f.pdf --share anyone
  python vidiflow-drive.py --download <FILE_ID> --output C:/out.pdf
  python vidiflow-drive.py --mkdir "AirPMD" --parent <FOLDER_ID>
  python vidiflow-drive.py --search "business plan"
  python vidiflow-drive.py --whoami
  python vidiflow-drive.py --check          # auth-only, no API call

Env (in %LOCALAPPDATA%\\hermes\\.env):
  GOOGLE_SERVICE_ACCOUNT_JSON   = full JSON, single line, quotes escaped
  ...or...
  GOOGLE_SERVICE_ACCOUNT_FILE   = path to the JSON file
  # optional, only for --oauth-token mode:
  GOOGLE_OAUTH_TOKEN            = contents of a google_token.json
"""
from __future__ import annotations

import argparse
import io
import json
import mimetypes
import os
import sys
import time

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload
except ImportError:  # pragma: no cover
    print(
        "ERROR: Google Drive client libraries are not installed.\n"
        "       C:\\Python314\\python.exe -m pip install google-api-python-client "
        "google-auth google-auth-httplib2 google-auth-oauthlib",
        file=sys.stderr,
    )
    raise SystemExit(3)

HERMES = os.path.expandvars(r"%LOCALAPPDATA%\hermes")
ENV_FILE = os.path.join(HERMES, ".env")
SCOPES = ["https://www.googleapis.com/auth/drive.file"]
SCOPES_BROAD = ["https://www.googleapis.com/auth/drive"]

# Drive caps a single multipart/resumable upload; anything large is resumable.
FOLDER_MIME = "application/vnd.google-apps.folder"
RESUMABLE_THRESHOLD = 8 * 1024 * 1024


class DriveError(RuntimeError):
    """Any failure that must surface loudly rather than silently 'succeeding'."""


def load_env(path: str = ENV_FILE) -> dict:
    env: dict = {}
    if not os.path.exists(path):
        raise DriveError(f"Hermes .env not found at {path}")
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip()
            if len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
                val = val[1:-1]
            env[key] = val
    return env


def creds_from_env(env: dict | None = None):
    """Build credentials. Service account preferred; OAuth token is the fallback."""
    env = env if env is not None else load_env()
    blob = env.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    keyfile = env.get("GOOGLE_SERVICE_ACCOUNT_FILE", "").strip()
    token = env.get("GOOGLE_OAUTH_TOKEN", "").strip()

    if blob or keyfile:
        info = json.loads(blob) if blob else json.load(open(keyfile, encoding="utf-8"))
        # A service account MUST get a subject to act as a user (domain-wide
        # delegation); without it Google rejects impersonation outright.
        subject = env.get("GOOGLE_IMPERSONATE_USER", "").strip()
        if not subject:
            raise DriveError(
                "Service account is configured but GOOGLE_IMPERSONATE_USER is not.\n"
                "  Service accounts have no Drive of their own and act as nobody by\n"
                "  default. Set GOOGLE_IMPERSONATE_USER=<workspace user email> for\n"
                "  domain-wide delegation, OR leave the service account empty and\n"
                "  instead share the target folder with the service account address\n"
                "  (…@<project>.iam.gserviceaccount.com) as Content Manager.\n"
                "  Service account email: " + info.get("client_email", "?")
            )
        creds = service_account.Credentials.from_service_account_info(
            info, scopes=SCOPES_BROAD, subject=subject)
        return creds, "service-account+delegation"

    if token:
        from google.oauth2.credentials import Credentials
        creds = Credentials(token=token, scopes=SCOPES_BROAD)
        return creds, "oauth-token"

    raise DriveError(
        "No Google Drive credentials configured.\n"
        "  Add ONE of these to " + ENV_FILE + ":\n"
        "    GOOGLE_SERVICE_ACCOUNT_JSON = {...}   (machine identity, best for a fleet)\n"
        "    GOOGLE_SERVICE_ACCOUNT_FILE = C:/path/sa.json\n"
        "    GOOGLE_OAUTH_TOKEN        = {...}   (acts as James personally)\n"
        "  Then share the target Drive folder with the service account address."
    )


def service(creds, version: str = "v3"):
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def _media(path: str):
    data = open(path, "rb").read()
    mt = mimetypes.guess_type(path)[0] or "application/octet-stream"
    return mt, data, (
        MediaIoBaseUpload(io.BytesIO(data), mimetype=mt, resumable=len(data) > RESUMABLE_THRESHOLD)
    )


def cmd_upload(svc, args) -> dict:
    if not os.path.exists(args.upload):
        raise DriveError(f"File not found: {args.upload}")
    mime, _, media = _media(args.upload)
    meta: dict = {"name": args.name or os.path.basename(args.upload)}
    if args.folder:
        meta["parents"] = [args.folder]
    elif not args.no_root:
        # Default to Drive root rather than "My Drive" shorthand ambiguity.
        meta["parents"] = ["root"]
    f = svc.files().create(body=meta, media_body=media, fields="id,name,webViewLink,size,parents").execute()
    out = {"status": "uploaded", **f}
    if args.share:
        p = svc.permissions().create(
            fileId=f["id"],
            body={"type": "anyone", "role": args.share},
            fields="id,type,role",
        ).execute()
        out["shared"] = {"role": args.share, "permissionId": p.get("id")}
    return out


def cmd_mkdir(svc, args) -> dict:
    meta = {"name": args.mkdir, "mimeType": FOLDER_MIME}
    if args.parent:
        meta["parents"] = [args.parent]
    f = svc.files().create(body=meta, fields="id,name,webViewLink").execute()
    return {"status": "created", **f}


def cmd_list(svc, args) -> dict:
    q = f"'{args.folder}' in parents and trashed=false" if args.folder else "trashed=false"
    r = svc.files().list(
        q=q, pageSize=100, orderBy="modifiedTime desc",
        fields="files(id,name,mimeType,size,modifiedTime,webViewLink,parents)",
        supportsAllDrives=True, includeItemsFromAllDrives=True,
    ).execute()
    return {"count": len(r.get("files", [])), "files": r.get("files", [])}


def cmd_search(svc, args) -> dict:
    esc = args.search.replace("'", r"\'")
    q = f"name contains '{esc}' and trashed=false"
    f = svc.files().list(
        q=q, pageSize=50,
        fields="files(id,name,mimeType,size,modifiedTime,webViewLink)",
        supportsAllDrives=True, includeItemsFromAllDrives=True,
    ).execute()
    return {"count": len(f.get("files", [])), "files": f.get("files", [])}


def cmd_download(svc, args) -> dict:
    req = svc.files().get_media(fileId=args.download, supportsAllDrives=True)
    buf = io.BytesIO()
    dl = MediaIoBaseDownload(buf, req)
    done = False
    while not done:
        _, done = dl.next_chunk()
    with open(args.output, "wb") as fh:
        fh.write(buf.getvalue())
    return {"status": "downloaded", "path": os.path.abspath(args.output),
            "bytes": len(buf.getvalue())}


def cmd_whoami(svc, args) -> dict:
    about = svc.about().get(fields="user,storageQuota").execute()
    return {"user": about.get("user"), "quota": about.get("storageQuota")}


def cmd_share(svc, args) -> dict:
    body: dict = {"type": args.share_type}
    if args.share_type == "user":
        body["emailAddress"] = args.email
    if args.share_role:
        body["role"] = args.share_role
    p = svc.permissions().create(
        fileId=args.share, body=body, fields="id,type,role,emailAddress").execute()
    return {"status": "shared", **p}


def cmd_delete(svc, args) -> dict:
    svc.files().update(fileId=args.delete, body={"trashed": True}, supportsAllDrives=True).execute()
    return {"status": "trashed", "fileId": args.delete}


def main() -> int:
    p = argparse.ArgumentParser(description="Google Drive read/write connector for Hermes.")
    mode = p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--upload")
    mode.add_argument("--download", metavar="FILE_ID")
    mode.add_argument("--mkdir", metavar="NAME")
    mode.add_argument("--list", action="store_true")
    mode.add_argument("--search", metavar="TERM")
    mode.add_argument("--share", metavar="FILE_ID", help="add a permission to FILE_ID")
    mode.add_argument("--delete", metavar="FILE_ID", help="move FILE_ID to trash (reversible)")
    mode.add_argument("--whoami", action="store_true")
    mode.add_argument("--check", action="store_true")
    p.add_argument("--name", help="name to store the uploaded file under")
    p.add_argument("--folder", help="parent folder id")
    p.add_argument("--parent", help="parent folder id (for --mkdir)")
    p.add_argument("--output", help="destination path (for --download)")
    p.add_argument("--share-type", default="user", choices=["user", "anyone", "domain"])
    p.add_argument("--share-role", default="reader", choices=["reader", "writer", "commenter", "fileOrganizer", "organizer"])
    p.add_argument("--upload-share", dest="upload_share",
                   help="share on upload: reader|writer|anyone", choices=["reader", "writer", "anyone"])
    p.add_argument("--dry-run", action="store_true", help="validate args and config, no API call")
    args = p.parse_args()

    try:
        creds, mode_name = creds_from_env()
        if args.dry_run or args.check:
            print(json.dumps({
                "status": "configured",
                "auth": mode_name,
                "client_email": getattr(creds, "service_account_email", None),
                "note": "credentials parsed OK; no Drive API call made"
                if args.check else "validate flags before doing anything destructive",
            }, indent=2))
            return 0
        svc = service(creds)
        handler = {
            "upload": cmd_upload, "mkdir": cmd_mkdir, "list": cmd_list,
            "search": cmd_search, "download": cmd_download, "whoami": cmd_whoami,
            "share": cmd_share, "delete": cmd_delete,
        }[("upload" if args.upload else "download" if args.download else
           "mkdir" if args.mkdir else "list" if args.list else "search" if args.search else
           "share" if args.share else "delete" if args.delete else "whoami")]
        out = handler(svc, args)
        print(json.dumps(out, indent=2, default=str))
        return 0
    except DriveError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1
    except Exception as e:  # noqa: BLE001 - surface everything loudly
        print(f"ERROR [{type(e).__name__}]: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
