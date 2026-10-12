#!/usr/bin/env python
"""Regenerate one VidiSmart landing band image at 2560x1440 via gpt-image-2.

Usage: python _gen_landing_band.py <key>   (key = split | stack)
Writes a real .png (magic-byte sniffed) and never echoes the API key.
"""
import base64
import io
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import vidi_image  # noqa: E402

from PIL import Image  # noqa: E402

OUT_DIR = pathlib.Path(r"M:\code\vidismart\landing\assets\img")

NOTEXT = (
    " CRITICAL: absolutely no text anywhere — no letters, no words, no numbers, no "
    "digits, no code, no labels, no captions, no watermarks, no user interface, no "
    "symbols. Purely abstract light and geometry."
)

PROMPTS = {
    "split": (
        "Wide cinematic 3D render, deep navy background. Five thin luminous dashed "
        "cyan lanes run horizontally, converging precisely into a single large "
        "faceted teal crystal core. The crystal core is centred in the frame, "
        "horizontally centred and vertically centred. Flowing light particles along "
        "the lanes, soft teal glow, premium technical illustration, symmetrical "
        "balanced composition, dark #0f172a backdrop, teal #10b981 highlights."
        + NOTEXT
    ),
    "stack": (
        "Wide cinematic 3D render, deep navy background. A stack of five large "
        "translucent frosted glass planes layered one above another, receding into "
        "depth, with thin glowing teal and blue light tracing across their surface. "
        "The glass layer cluster fills the centre of the frame, vertically and "
        "horizontally centred, with soft reflections. Premium minimal product "
        "visual, dark #0f172a backdrop, blue and teal accents, depth of field."
        + NOTEXT
    ),
}


def sniff_ext(data: bytes) -> str:
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if data[:2] == b"\xff\xd8":
        return ".jpg"
    if data[:4] == b"RIFF":
        return ".webp"
    raise RuntimeError("unrecognised image magic bytes")


def main():
    key = sys.argv[1]
    imgs, raw = vidi_image.generate(
        PROMPTS[key], model="gpt-image-2", size="2560x1440", timeout=420
    )
    if not imgs:
        raise SystemExit("NO IMAGE RETURNED")
    data = base64.b64decode(imgs[0]) if not imgs[0].startswith("http") else None
    if data is None:
        import urllib.request

        with urllib.request.urlopen(imgs[0], timeout=120) as r:
            data = r.read()
    out = OUT_DIR / f"_cand-{key}{sniff_ext(data)}"
    out.write_bytes(data)
    im = Image.open(io.BytesIO(data))
    im.verify()
    im = Image.open(io.BytesIO(data))
    print(f"WROTE {out}  format={im.format} size={im.size} bytes={len(data)}")


if __name__ == "__main__":
    main()
