#!/usr/bin/env python
"""
VidiFlow job-finished mailer — the standing "email James when a job finishes" tool.

WHY THIS EXISTS
  James gave a PERMANENT send approval: when a Hermes sub-agent finishes a job,
  mail vidiman@vidimail.com from vidiman@vidimail.com saying what finished and where
  the result is. No new approval is needed per send. This script IS that sender, so
  no future run has to hand-roll SMTP or rediscover the credentials.

VERIFIED TRANSPORT on this box (2026-10-04): SiteGround SMTP, gtxm1356.siteground.biz
  port 465, implicit TLS + auth required. Credentials come from the Hermes .env
  (EMAIL_ADDRESS / EMAIL_SMTP_HOST / EMAIL_SMTP_PORT / EMAIL_PASSWORD).

WHY smtplib AND NOT himalaya / the email gateway
  This box is CLI-only: the gateway notifier has no live delivery channel back into a
  CLI session, so a cron `deliver='origin'` or a gateway email route would silently
  deliver nowhere. Direct SMTP is the only path that actually puts mail in the box.

DID NOT SEND ON CREATION (by instruction)
  Built and syntax/self-checked only. The first real send happens on the next
  finished job, not while wiring this up.

Usage (both forms work; every flag has a sane default so a sub-agent can't fumble it):
  python vidiflow-mail.py --subject "Pack A seeded" --body "12 captures in ..."
  python vidiflow-mail.py "subject text" "body text"
  python vidiflow-mail.py --subject "..." --link http://127.0.0.1:8765/ --link-file C:/out.png
"""
from __future__ import annotations

import argparse
import mimetypes
import os
import smtplib
import ssl
import sys
from email.message import EmailMessage
from email.utils import formatdate, make_msgid

HERMES = os.path.expandvars(r"%LOCALAPPDATA%\hermes")


def _has_mail_creds(path: str) -> bool:
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            for raw in fh:
                if raw.strip().startswith("EMAIL_PASSWORD="):
                    return True
    except OSError:
        return False
    return False


def _resolve_env_file() -> str:
    """Find a Hermes .env that actually carries the SMTP credentials.

    Original Windows layout: %LOCALAPPDATA%\\hermes\\.env. On Linux/macOS the install
    lives at $HERMES_HOME or ~/.hermes. Note $HERMES_HOME in a profile session points
    at the *profile* dir, whose .env usually has no EMAIL_* keys — so prefer whichever
    candidate genuinely has EMAIL_PASSWORD, and only then fall back to first-existing.
    """
    candidates = []
    home = os.environ.get("HERMES_HOME")
    candidates.append(os.path.join(HERMES, ".env"))
    if home:
        candidates.append(os.path.join(home, ".env"))
        # profile home -> the parent install's .env (…/profiles/<name> -> …/.env)
        candidates.append(os.path.join(os.path.dirname(os.path.dirname(home)), ".env"))
    candidates.append(os.path.expanduser("~/.hermes/.env"))

    existing = [c for c in candidates if c and os.path.exists(c)]
    for cand in existing:
        if _has_mail_creds(cand):
            return cand
    return existing[0] if existing else candidates[0]


ENV_FILE = _resolve_env_file()

# Defaults mirror the standing instruction so the common call needs only a subject.
DEFAULT_SUBJECT = "Hermes job finished"
DEFAULT_BODY = "A Hermes job finished. See the result in the browser."
# James's standing rule is explicitly sender -> SAME address. EMAIL_HOME_ADDRESS is the
# gateway's home address (vidistudios@gmail.com) and is NOT the alert target — reading
# the recipient from there silently mailed the wrong person once already.
ALERT_TO = "vidiman@vidimail.com"


class MailError(RuntimeError):
    """Any failure that must surface loudly rather than silently 'succeeding'."""


def load_env(path: str = ENV_FILE) -> dict:
    """Read Hermes .env. Commented-out lines are reported, not silently used."""
    env: dict = {}
    if not os.path.exists(path):
        raise MailError(f"Hermes .env not found at {path}")
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            value = value.strip().strip('"').strip("'")
            env[key.strip()] = value
    return env


def _resolve_config(env: dict) -> tuple:
    """Pull SMTP settings + the password. EmailMessage handles the auth user split."""
    host = env.get("EMAIL_SMTP_HOST", "").strip()
    port = int(env.get("EMAIL_SMTP_PORT", "465") or 465)
    sender = env.get("EMAIL_ADDRESS", "").strip()
    password = env.get("EMAIL_PASSWORD", "").strip()

    missing = [n for n, v in
               (("EMAIL_SMTP_HOST", host), ("EMAIL_ADDRESS", sender), ("EMAIL_PASSWORD", password))
               if not v]
    if missing:
        raise MailError(f"Missing required .env keys: {', '.join(missing)}")

    return host, port, sender, password


def build_message(sender: str, recipient: str, subject: str, body: str,
                  links: list, files: list) -> EmailMessage:
    """Compose the alert. Subject is kept short and on one line (no widow risk in a
    mail client list view); links are bare-URL so they stay clickable."""
    msg = EmailMessage()
    msg["From"] = sender
    msg["To"] = recipient
    msg["Subject"] = " ".join(subject.split())[:200]  # collapse newlines: header injection guard
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="vidimail.com")

    # Links go in the plain body as bare URLs (clickable everywhere, no HTML needed).
    text = (body.strip() + "\n") if body else ""
    if links:
        text += "\nResult links:\n" + "\n".join(
            str(u).strip() for u in links if str(u).strip()) + "\n"
    msg.set_content(text)

    for path in files:
        p = str(path).strip()
        if not p or not os.path.exists(p):
            raise MailError(f"Attachment not found: {p}")
        ctype, _ = mimetypes.guess_type(p)
        maintype, _, subtype = (ctype or "application/octet-stream").partition("/")
        with open(p, "rb") as fh:
            msg.add_attachment(fh.read(), maintype=maintype or "application",
                               subtype=subtype or "octet-stream",
                               filename=os.path.basename(p))
    return msg


def send(subject: str, body: str, links=None, files=None, recipient: str = None,
         timeout: int = 45) -> str:
    """Send the alert over implicit-TLS SMTP. Returns the SMTP response line.

    Raises MailError on any failure — a caller must never see a bare 'sent' that
    did not leave the box.
    """
    links = list(links or [])
    files = list(files or [])
    env = load_env()
    host, port, sender, password = _resolve_config(env)
    to = (recipient or ALERT_TO).strip()

    msg = build_message(sender, to, subject, body, links, files)
    ctx = ssl.create_default_context()
    try:
        with smtplib.SMTP_SSL(host, port, context=ctx, timeout=timeout) as smtp:
            smtp.ehlo()
            smtp.login(sender, password)   # user == full address on SiteGround
            refused = smtp.send_message(msg)
    except smtplib.SMTPException as exc:
        raise MailError(f"SMTP send failed ({host}:{port}): {exc}") from exc
    except ssl.SSLError as exc:
        raise MailError(f"TLS failed to {host}:{port}: {exc}") from exc
    except OSError as exc:
        raise MailError(f"Cannot reach {host}:{port}: {exc}") from exc

    bad = {k: v for k, v in (refused or {}).items()}
    if bad:
        raise MailError(f"Recipient refused: {bad}")
    return f"Sent to {to} via {host}:{port} ({host})"


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Send the standing job-finished alert to James.")
    ap.add_argument("subject_pos", nargs="?", default=None, help="subject (or use --subject)")
    ap.add_argument("body_pos", nargs="?", default=None, help="body (or use --body)")
    ap.add_argument("--subject", default=None)
    ap.add_argument("--body", default=None)
    ap.add_argument("--link", action="append", default=[], help="result URL (repeatable)")
    ap.add_argument("--link-file", action="append", default=[],
                    help="attach a file, e.g. a screenshot (repeatable)")
    ap.add_argument("--to", default=None, help="override recipient")
    ap.add_argument("--dry-run", action="store_true",
                    help="build + verify only; never opens a socket")
    args = ap.parse_args(argv)

    subject = args.subject or args.subject_pos or DEFAULT_SUBJECT
    body = args.body or args.body_pos or DEFAULT_BODY

    if args.dry_run:
        env = load_env()
        host, port, sender, _pw = _resolve_config(env)
        to = (args.to or ALERT_TO).strip()
        msg = build_message(sender, to, subject, body, args.link, [])
        print(f"DRY RUN — nothing sent.\n  from: {sender}\n  to:   {to}\n"
              f"  via:  {host}:{port} (implicit TLS)\n  subj: {msg['Subject']}\n"
              f"  body chars: {len(msg.get_content())}\n  links: {args.link or '(none)'}")
        return 0

    try:
        print(send(subject, body, links=args.link, files=args.link_file,
                   recipient=args.to))
        return 0
    except MailError as exc:
        print(f"MAIL FAILED: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
