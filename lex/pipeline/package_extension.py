"""Package the Lexi Chrome extension into a versioned zip and publish it to cdn.vidi.news.

The landing page's install button points at the CDN, NOT at a file on the Ubuntu box:
`vidiflow.net` is tunneled + Access-gated and was not reachable from the build host,
while `https://cdn.vidi.news/<key>` is a live public R2 custom domain.

Usage (Windows):
    C:\\Python314\\python.exe M:\\code\\vidismart\\lex\\pipeline\\package_extension.py
    C:\\Python314\\python.exe M:\\code\\vidismart\\lex\\pipeline\\package_extension.py --upload

Env for --upload:
    CF_API_TOKEN   Cloudflare API token with "Workers R2 Storage: Edit"
                   (account 5830508745fd2ac063426ebf9429c22d, bucket `vidismart`)

Uploads two keys:
    downloads/lexi-extension-v<version>.zip
    downloads/lexi-extension-latest.zip      <- the URL the landing page links to
"""
import argparse
import hashlib
import json
import os
import sys
import urllib.request
import urllib.error
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent          # lex/pipeline
LEX = HERE.parent                               # lex
EXT = LEX / "extension"                         # lex/extension
REPO = LEX.parent                               # M:/code/vidismart
OUT_DIR = REPO / "downloads"

ACCOUNT_ID = "5830508745fd2ac063426ebf9429c22d"
BUCKET = "vidismart"
CDN = "https://cdn.vidi.news"

REQUIRED = ["manifest.json", "data.js", "content.js", "popup.html", "popup.js", "tooltip.css"]
OPTIONAL = ["terms.js", "background.js", "options.html", "options.js"]
SKIP_SUFFIXES = (".map", ".psd", ".md", ".txt")
SKIP_NAMES = {".DS_Store", "Thumbs.db"}


def read_version() -> str:
    manifest = json.loads((EXT / "manifest.json").read_text(encoding="utf-8"))
    version = str(manifest.get("version", "")).strip()
    if not version:
        sys.exit("manifest.json has no version")
    return version


def collect() -> list[Path]:
    """Runtime files only — no READMEs, source maps or OS cruft in the store zip."""
    missing = [name for name in REQUIRED if not (EXT / name).is_file()]
    if missing:
        sys.exit("missing required extension files: " + ", ".join(missing))

    files: list[Path] = [(EXT / name) for name in REQUIRED]
    files += [(EXT / name) for name in OPTIONAL if (EXT / name).is_file()]
    files += [
        p for p in sorted((EXT / "icons").rglob("*"))
        if p.is_file() and p.suffix.lower() == ".png"
    ]
    return [
        p for p in files
        if p.suffix.lower() not in SKIP_SUFFIXES and p.name not in SKIP_NAMES
    ]


def build_zip(target: Path, files: list[Path]) -> tuple[int, str]:
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in files:
            zf.write(path, arcname=path.relative_to(EXT).as_posix())
    payload = target.read_bytes()
    return len(payload), hashlib.sha256(payload).hexdigest()


def put_object(key: str, payload: bytes, token: str) -> None:
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/r2/buckets/{BUCKET}/objects/{key}"
    request = urllib.request.Request(
        url,
        data=payload,
        method="PUT",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/zip",
            "Content-Length": str(len(payload)),
        },
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        if response.status not in (200, 201):
            sys.exit(f"upload failed for {key}: HTTP {response.status}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--upload", action="store_true", help="publish to cdn.vidi.news (needs CF_API_TOKEN)")
    args = parser.parse_args()

    version = read_version()
    files = collect()
    target = OUT_DIR / f"lexi-extension-v{version}.zip"
    size, digest = build_zip(target, files)

    print(f"packaged {len(files)} files -> {target}")
    print(f"  size   : {size:,} bytes")
    print(f"  sha256 : {digest}")
    print(f"  url    : {CDN}/downloads/lexi-extension-v{version}.zip")

    if not args.upload:
        print("\nPass --upload (and set CF_API_TOKEN) to publish to the CDN.")
        return

    token = os.environ.get("CF_API_TOKEN", "").strip()
    if not token:
        sys.exit("CF_API_TOKEN is not set — cannot upload")

    payload = target.read_bytes()
    versioned = f"downloads/lexi-extension-v{version}.zip"
    for key in (versioned, "downloads/lexi-extension-latest.zip"):
        try:
            put_object(key, payload, token)
            print(f"uploaded {CDN}/{key}")
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", "replace")[:400]
            sys.exit(f"upload failed for {key}: HTTP {exc.code} {body}")

    print("\nNext: point the install button in monetization/vidiflow-lex.html and")
    print("lex/app/index.html at:")
    print(f"  {CDN}/downloads/lexi-extension-latest.zip")


if __name__ == "__main__":
    main()
