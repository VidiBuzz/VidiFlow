"""Nano Banana (Gemini image) via OpenRouter — real render, real verification.

Nano Banana      = google/gemini-2.5-flash-image   ($0.30/M img tokens)
Nano Banana Pro  = google/gemini-3-pro-image       ($2.00/M img tokens)

Writes PNGs next to this script and prints byte size + pixel dimensions so the
output can be verified rather than assumed.
"""
from __future__ import annotations

import base64
import json
import os
import re
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ENV = r"C:\Users\James\AppData\Local\hermes\.env"
URL = "https://openrouter.ai/api/v1/chat/completions"


def key() -> str:
    for line in open(ENV, encoding="utf-8", errors="replace").read().splitlines():
        if line.startswith("OPENROUTER_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("no OPENROUTER_API_KEY in .env")


def render(model: str, prompt: str, outfile: str) -> dict:
    body = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "modalities": ["image", "text"],
    }).encode()
    req = urllib.request.Request(URL, data=body, method="POST", headers={
        "Authorization": f"Bearer {key()}",
        "Content-Type": "application/json",
    })
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=180) as r:
        payload = json.loads(r.read().decode("utf-8", "replace"))
    dt = time.time() - t0

    msg = (payload.get("choices") or [{}])[0].get("message") or {}
    imgs = msg.get("images") or []
    text = msg.get("content") or ""
    if not imgs:
        return {"ok": False, "model": model, "error": "no image in response",
                "text": text[:300], "usage": payload.get("usage"),
                "raw_keys": list(payload.keys())}

    url = imgs[0].get("image_url", {}).get("url", "")
    m = re.match(r"data:image/(\w+);base64,(.*)$", url, re.S)
    if not m:
        return {"ok": False, "model": model, "error": f"unexpected image_url: {url[:80]}"}
    fmt, b64 = m.group(1), m.group(2)
    raw = base64.b64decode(b64)
    path = os.path.join(HERE, outfile)
    with open(path, "wb") as fh:
        fh.write(raw)

    dims = None
    try:
        from PIL import Image
        with Image.open(path) as im:
            dims = im.size
            mode = im.mode
            extrema = im.getextrema()
    except Exception as e:
        mode, extrema = f"(PIL: {e})", None

    return {"ok": True, "model": model, "path": path, "bytes": len(raw),
            "format": fmt, "w": dims[0] if dims else None,
            "h": dims[1] if dims else None, "mode": mode,
            "extrema": str(extrema)[:120], "seconds": round(dt, 1),
            "text": text[:200], "usage": payload.get("usage")}


if __name__ == "__main__":
    # Real VidiSmart site hero — the brand is spelled exactly "VidiSmart" (one word).
    prompt = (sys.argv[1] if len(sys.argv) > 1 else
              "Website hero image for a 2026 AI video platform. A glowing holographic "
              "control-room console forms a fanned-out ring of floating translucent screens, "
              "each showing a different live video feed; a luminous white hydra emblem with "
              "trailing chrome tentacles arcs through the centre. Deep navy-to-black gradient "
              "background, cyan and magenta volumetric lighting, glassmorphism UI panels, "
              "soft bloom, cinematic depth of field, ultra sharp, photorealistic product render. "
              "Render the brand wordmark \"VidiSmart\" in clean bold sans-serif capitals, "
              "correctly spelled, on the central panel.")
    jobs = [
        ("google/gemini-2.5-flash-image", "nanobanana.png"),
        ("google/gemini-3-pro-image",     "nanobanana_pro.png"),
    ]
    for model, fn in jobs:
        print(f"--- {model}", flush=True)
        try:
            res = render(model, prompt, fn)
        except Exception as e:
            res = {"ok": False, "model": model, "error": f"{type(e).__name__}: {e}"}
        print(json.dumps(res, indent=2)[:900], flush=True)
