#!/usr/bin/env python
"""
VidiTwin landing imagery — generate + measure.

Wraps the verified generator (vidi_image.py / grok-imagine) and records, per
image: real pixel dimensions, true container format from magic bytes, and
accent-pixel agreement against the VidiTwin phosphor accent #5ef2b4.

Accent agreement metric
-----------------------
A pixel "agrees" when it sits inside the per-channel tolerance of the accent
hex in sRGB. Tolerance 26/channel covers JPEG chroma subsampling and the
perceptual spread of a glow falling off its core. Reported two ways:
  hit%   = agreeing pixels / (non-background pixels)
  share% = agreeing pixels / total pixels
`share%` is the honest headline number; `hit%` excludes the near-black plate
so a mostly-black frame doesn't fake a good score.
"""
from __future__ import annotations

import base64
import json
import pathlib
import sys
import urllib.request

import numpy as np

sys.path.insert(0, r"M:\code\VidiFlow\out\fleet")
from vidi_image import generate  # noqa: E402

from PIL import Image  # noqa: E402

ACCENT = (0x5E, 0xF2, 0xB4)      # --phos, from apps/web/app/globals.css
TOL = 26
BG_LUMA = 46                      # below this a pixel is background plate


def magic(data: bytes) -> str:
    if data[:3] == b"\xff\xd8\xff":
        return "JPEG"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "PNG"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "GIF"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "WEBP"
    return "UNKNOWN"


def measure(path: pathlib.Path) -> dict:
    data = path.read_bytes()
    im = Image.open(path).convert("RGB")
    w, h = im.size
    # int32, not int16: the luma weighted sum peaks at 255*(299+587+114)=255,000,
    # which wraps negative in int16 and silently reports a black frame.
    arr = np.asarray(im, dtype=np.int32)
    agree_mask = (
        (np.abs(arr[:, :, 0] - ACCENT[0]) <= TOL)
        & (np.abs(arr[:, :, 1] - ACCENT[1]) <= TOL)
        & (np.abs(arr[:, :, 2] - ACCENT[2]) <= TOL)
    )
    luma = (arr[:, :, 0] * 299 + arr[:, :, 1] * 587 + arr[:, :, 2] * 114) // 1000
    fg_mask = luma > BG_LUMA
    agree = int(agree_mask.sum())
    fg = int(fg_mask.sum())
    total = w * h
    return {
        "file": path.name,
        "requested_ext": path.suffix.lstrip("."),
        "magic_format": magic(data),
        "width": w,
        "height": h,
        "aspect": round(w / h, 3),
        "bytes": len(data),
        "kb": round(len(data) / 1024, 1),
        "accent_hex": "#%02x%02x%02x" % ACCENT,
        "tolerance_per_channel": TOL,
        "accent_share_pct": round(agree / total * 100, 2),
        "accent_hit_of_fg_pct": round(agree / fg * 100, 2) if fg else 0.0,
        "foreground_pct": round(fg / total * 100, 2),
    }


def main() -> None:
    spec = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    outdir = pathlib.Path(spec["outdir"])
    outdir.mkdir(parents=True, exist_ok=True)
    report = []

    for item in spec["images"]:
        out = outdir / item["file"]
        imgs, raw = generate(item["prompt"], model=spec.get("model", "grok-imagine"))
        if not imgs:
            report.append({"file": item["file"], "error": "NO IMAGE RETURNED",
                           "raw": json.dumps(raw)[:400]})
            print(json.dumps(report[-1], indent=2))
            continue
        if imgs[0].startswith("http"):
            with urllib.request.urlopen(imgs[0], timeout=60) as r:
                out.write_bytes(r.read())
        else:
            out.write_bytes(base64.b64decode(imgs[0]))

        ci = raw.get("cheaper_inference", {})
        rec = measure(out)
        rec["billing"] = ci
        rec["prompt"] = item["prompt"]
        rec["role"] = item["role"]
        report.append(rec)
        print(json.dumps(rec, indent=2), flush=True)

    (outdir / "IMAGES.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    billed = sum(
        r.get("billing", {}).get("cost", 0) or 0
        for r in report if "billing" in r
    )
    print(f"\n=== {len(report)} images | billed total: ${billed:.4f} ===")


if __name__ == "__main__":
    main()