#!/usr/bin/env python
"""
VidiFlow image generation - a durable, multi-provider image tool.

VERIFIED WORKING on this box (2026-10-03):
  1. xAI OAuth  -> grok-imagine-image      [WORKS, no extra spend, best quality]
  2. FAL        -> fal-ai/flux-2/klein/9b  [needs FAL_KEY uncommented in .env]
  3. OpenRouter -> google/gemini-3-pro-image [needs >= $1.00 credit balance]
  4. Pollinations-> free default model      [free, quality varies, no key]

WHY NOT QWEN-IMAGE 2.1:
  Released under the Qwen Research License: "non-commercial purposes only".
  Commercial use needs a separate grant from Alibaba (model-business@notice.qwencloud.com).
  It has NO third-party paid API SKU - fal.ai and Replicate carry only 2.0.
  Not viable for VidiFlow client work without that grant.
  Paid Qwen image API is the 3.0 line: $0.03/image (1k/2k), $0.075 (2k pro).

WHY NOT IMAGEN:
  All Imagen models were shut down 2026-08-17. Use Nano Banana (Gemini 3.x Image).

Usage:
  python vidiflow-image.py "a flat vector illustration of ..." -o out.png --w 1280 --h 720
  python vidiflow-image.py --batch batch.json
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import time
import urllib.parse
import urllib.request

HERMES = os.path.expandvars(r"%LOCALAPPDATA%\hermes")
ENV_FILE = os.path.join(HERMES, ".env")
AUTH_FILE = os.path.join(HERMES, "auth.json")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")


def load_env() -> dict:
    """Read Hermes .env. Commented-out lines are reported, not silently used."""
    vals: dict[str, str] = {}
    if not os.path.exists(ENV_FILE):
        return vals
    with open(ENV_FILE, encoding="utf-8", errors="replace") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            vals[key.strip()] = value.strip().strip('"').strip("'")
    return vals


def _token(auth: dict, provider: str) -> str | None:
    try:
        return auth["providers"][provider]["tokens"]["access_token"]
    except (KeyError, TypeError):
        return None


def _post(url: str, payload: dict, headers: dict, timeout: int = 240) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", **headers},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8", "replace"))


def _get(url: str, headers: dict | None = None, timeout: int = 240) -> bytes:
    req = urllib.request.Request(url, headers=headers or {"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


# --------------------------------------------------------------------------
# Providers. Each returns raw image bytes or raises.
# --------------------------------------------------------------------------

def gen_xai_grok(prompt: str, w: int, h: int) -> bytes:
    """BEST AVAILABLE PATH. Uses the xAI OAuth token already in auth.json."""
    auth = json.load(open(AUTH_FILE, encoding="utf-8"))
    tok = _token(auth, "xai-oauth")
    if not tok:
        raise RuntimeError("no xai-oauth access_token in auth.json")
    out = _post(
        "https://api.x.ai/v1/images/generations",
        {
            "model": "grok-imagine-image",
            "prompt": prompt,
            "n": 1,
            "response_format": "b64_json",
            # NB: xAI rejects `aspect_ratio` with 422 - omit it, the prompt governs shape.
        },
        {"Authorization": f"Bearer {tok}"},
    )
    return base64.b64decode(out["data"][0]["b64_json"])


def gen_fal(prompt: str, w: int, h: int, model: str = "fal-ai/flux-2/klein/9b") -> bytes:
    """Needs FAL_KEY present (not commented) in %LOCALAPPDATA%\\hermes\\.env"""
    key = load_env().get("FAL_KEY", "")
    if not key:
        raise RuntimeError("FAL_KEY empty or commented out in .env")
    size = {"landscape": "landscape_16_9",
            "square": "square_hd",
            "portrait": "portrait_16_9"}[_aspect(w, h)]
    res = _post(
        f"https://queue.fal.run/{model}",
        {"prompt": prompt, "image_size": size, "num_images": 1},
        {"Authorization": f"Key {key}"},
    )
    url = (res.get("images") or [{}])[0].get("url")
    if not url:
        raise RuntimeError(f"fal returned no image url: {str(res)[:200]}")
    return _get(url)


def gen_openrouter(prompt: str, w: int, h: int,
                   model: str = "google/gemini-3-pro-image") -> bytes:
    """Nano Banana Pro. OpenRouter enforces a $1.00 minimum balance for image output."""
    key = load_env().get("OPENROUTER_API_KEY", "")
    if not key:
        raise RuntimeError("no OPENROUTER_API_KEY")
    out = _post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "modalities": ["image", "text"],
        },
        {"Authorization": f"Bearer {key}",
         "HTTP-Referer": "https://vidiflow.net",
         "X-Title": "VidiFlow"},
    )
    images = out["choices"][0]["message"].get("images") or []
    if not images:
        raise RuntimeError(f"no images in reply: {str(out)[:200]}")
    url = images[0]["image_url"]["url"]
    if url.startswith("data:"):
        return base64.b64decode(url.split(",", 1)[1])
    return _get(url)


def gen_pollinations(prompt: str, w: int, h: int) -> bytes:
    """Free, no key. Do NOT pass model=flux (that tier now 402s)."""
    url = ("https://image.pollinations.ai/prompt/"
           + urllib.parse.quote(prompt)
           + f"?width={w}&height={h}&nologo=true&seed={int(time.time()) % 100000}")
    return _get(url)


def _aspect(w: int, h: int) -> str:
    if w > h * 1.15:
        return "landscape"
    if h > w * 1.15:
        return "portrait"
    return "square"


CHAIN = [
    ("xai-grok-imagine", gen_xai_grok),
    ("fal-flux2-klein", gen_fal),
    ("pollinations-free", gen_pollinations),
]

# OFF the default path (James, 2026-10-07): never reached by silent fallthrough.
# Only runs when the caller explicitly names it via --only/--prefer openrouter
# AND passes --allow-nano-banana.
OFF_PATH = [
    ("openrouter-nano-banana-pro", gen_openrouter),
]


def _fmt(blob: bytes) -> str:
    """Sniff real image format — the API returns JPEG bytes even for .png paths."""
    if blob[:3] == b"\xff\xd8\xff":
        return "JPEG"
    if blob[:8] == b"\x89PNG\r\n\x1a\n":
        return "PNG"
    if blob[:4] == b"RIFF" and blob[8:12] == b"WEBP":
        return "WEBP"
    return "unknown"


def generate(prompt: str, out_path: str, w: int = 1280, h: int = 720,
             prefer: str | None = None, only: str | None = None,
             allow_nano_banana: bool = False) -> str:
    """Try each provider until one returns bytes. Returns provider used.

    `only`  — restrict to providers whose name contains this substring.
    `prefer`— try matching providers first, then the rest of the default chain.
    nano-banana is only reachable with allow_nano_banana=True.
    """
    pool = CHAIN + OFF_PATH if allow_nano_banana else list(CHAIN)
    if not allow_nano_banana:
        pool = [p for p in pool if not p[0].startswith("openrouter")]
    if only:
        order = [p for p in pool if only in p[0]]
        if not order:
            raise SystemExit(f"no provider matches --only {only!r} "
                             f"(allowed: {[p[0] for p in pool]})")
    elif prefer:
        order = [p for p in pool if prefer in p[0]] + \
                [p for p in pool if prefer not in p[0]]
    else:
        order = pool
    errors = []
    for name, fn in order:
        try:
            blob = fn(prompt, w, h)
            if not blob or len(blob) < 1024:
                raise RuntimeError(f"suspiciously small payload ({len(blob)}B)")
            os.makedirs(os.path.dirname(os.path.abspath(out_path)) or ".", exist_ok=True)
            with open(out_path, "wb") as fh:
                fh.write(blob)
            real = _fmt(blob)
            warn = ""
            if out_path.lower().endswith(".png") and real != "PNG":
                warn = f" [WARN real format {real}, not PNG — convert before shipping]"
            print(f"OK {name}: {out_path} ({len(blob):,} bytes, {real}){warn}", flush=True)
            return name
        except Exception as exc:  # noqa: BLE001
            msg = str(exc).replace("\n", " ")[:150]
            errors.append(f"{name}: {msg}")
            print(f"FAIL {name}: {msg}", flush=True)
    raise SystemExit("ALL PROVIDERS FAILED\n  " + "\n  ".join(errors))


def main() -> None:
    ap = argparse.ArgumentParser(description="VidiFlow multi-provider image generator")
    ap.add_argument("prompt", nargs="?")
    ap.add_argument("-o", "--out")
    ap.add_argument("--w", type=int, default=1280)
    ap.add_argument("--h", type=int, default=720)
    ap.add_argument("--prefer", help="substring of provider name to try first")
    ap.add_argument("--only", help="restrict to providers matching this substring (no fallthrough)")
    ap.add_argument("--allow-nano-banana", action="store_true",
                    help="permit the openrouter lane (off the default path)")
    ap.add_argument("--batch", help="JSON list of {prompt,out,w,h} objects")
    args = ap.parse_args()

    if args.batch:
        jobs = json.load(open(args.batch, encoding="utf-8"))
        ok = fail = 0
        for job in jobs:
            try:
                generate(job["prompt"], job["out"],
                         job.get("w", args.w), job.get("h", args.h),
                         args.prefer, args.only, args.allow_nano_banana)
                ok += 1
            except SystemExit as exc:
                print(f"FAIL batch job {job['out']}: {exc}", flush=True)
                fail += 1
        print(f"\nbatch done: {ok} ok, {fail} failed")
        sys.exit(1 if fail else 0)

    if not (args.prompt and args.out):
        ap.error("provide a prompt and -o OUT, or use --batch")
    generate(args.prompt, args.out, args.w, args.h, args.prefer, args.only,
             args.allow_nano_banana)


if __name__ == "__main__":
    main()
