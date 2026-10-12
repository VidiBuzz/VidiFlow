#!/usr/bin/env python
"""
VidiBot image generator — grok-imagine via Cheaper Inference.

Verified pricing (fetched from live catalog 2026-10-06T01:15:06Z):
    grok-imagine:  $0.017/image  (maker list $0.020, 15% off)
Endpoint:        POST https://api.cheaperinference.com/v1/images/generations
Auth:            Authorization: Bearer ci_live_...

The API key is read from the Hermes .env at runtime. It is never printed, never
logged, and never passed on a command line where it would land in shell history.
"""
import os
import re
import json
import urllib.request
import urllib.error

ENV_PATH = os.path.join(
    os.environ.get("APPDATA", r"C:\Users\James\AppData\Roaming"),
    "..", "Local", "hermes", ".env",
)
BASE = "https://api.cheaperinference.com/v1"


def _read_key():
    """Pull CHEAPER_INFERENCE_API_KEY out of the Hermes .env."""
    for path in (ENV_PATH, r"C:\Users\James\AppData\Local\hermes\.env"):
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8", errors="replace") as fh:
            for line in fh:
                line = line.strip()
                if line.startswith("CHEAPER_INFERENCE_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("CHEAPER_INFERENCE_API_KEY not found in Hermes .env")


def generate(prompt, model="grok-imagine", size="1024x1024", n=1, timeout=180):
    """Generate image(s). Returns (list_of_b64_or_urls, raw_response_dict)."""
    key = _read_key()
    body = json.dumps({
        "model": model,
        "prompt": prompt,
        "n": n,
        "size": size,
    }).encode()

    req = urllib.request.Request(
        f"{BASE}/images/generations",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = json.loads(resp.read())

    images = []
    for item in data.get("data", []):
        if item.get("b64_json"):
            images.append(item["b64_json"])
        elif item.get("url"):
            images.append(item["url"])
    return images, data


if __name__ == "__main__":
    import sys
    import base64
    import pathlib

    if len(sys.argv) < 2:
        print("usage: vidi_image.py \"<prompt>\" [outfile.png] [model]")
        sys.exit(1)

    prompt = sys.argv[1]
    out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "out.png")
    model = sys.argv[3] if len(sys.argv) > 3 else "grok-imagine"

    imgs, raw = generate(prompt, model=model)
    print(f"model={model}  returned={len(imgs)}")

    # billing block — proves what actually charged
    ci = raw.get("cheaper_inference", {})
    if ci:
        print(f"billing: {json.dumps(ci)}")

    if imgs and not imgs[0].startswith("http"):
        out.write_bytes(base64.b64decode(imgs[0]))
        print(f"wrote {out}  ({out.stat().st_size} bytes)")
    elif imgs:
        with urllib.request.urlopen(imgs[0], timeout=60) as r:
            out.write_bytes(r.read())
        print(f"downloaded to {out}  ({out.stat().st_size} bytes)")
    else:
        print("NO IMAGE RETURNED")
        print(json.dumps(raw)[:800])
        sys.exit(1)