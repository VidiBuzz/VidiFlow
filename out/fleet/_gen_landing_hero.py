#!/usr/bin/env python
"""Generate the VidiSmart landing hero at 2560x1440 with NO text on the panels.

grok-imagine is hard-capped at 1280x720 and reliably hallucinates pseudo-code on
any "glass panel" motif. gpt-image-2 honours the requested size and respects a
strong no-text instruction, so it is used here instead.

Writes a real .png (sniffed from magic bytes) and never echoes the API key.
"""
import base64
import io
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import vidi_image  # noqa: E402

from PIL import Image  # noqa: E402

OUT_DIR = pathlib.Path(r"M:\code\vidismart\landing\assets\img")

PROMPT = (
    "Abstract dark technology background, deep navy to indigo gradient (#0f172a to "
    "#1e3a8a), a vast constellation of small glowing spherical nodes connected by "
    "delicate luminous filament threads spreading across a dark reflective plane, "
    "depth of field, soft volumetric light, cinematic, premium, minimal, "
    "photorealistic 3D render. "
    "CRITICAL: absolutely NO text anywhere. No letters, no words, no numbers, no "
    "digits, no code, no hex, no captions, no labels, no watermarks, no signage, no "
    "user interface, no symbols. Purely abstract light and geometry."
)


def sniff_ext(data: bytes) -> str:
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if data[:2] == b"\xff\xd8":
        return ".jpg"
    if data[:4] == b"RIFF":
        return ".webp"
    raise RuntimeError("unrecognised image magic bytes")


def main():
    size = sys.argv[1] if len(sys.argv) > 1 else "2560x1440"
    stem = sys.argv[2] if len(sys.argv) > 2 else "hero-fleet"

    imgs, raw = vidi_image.generate(PROMPT, model="gpt-image-2", size=size, timeout=420)
    ci = raw.get("cheaper_inference", {})
    if ci:
        print("billing:", {k: v for k, v in ci.items() if "key" not in k.lower()})

    if not imgs:
        raise SystemExit("NO IMAGE RETURNED")

    data = base64.b64decode(imgs[0]) if not imgs[0].startswith("http") else None
    if data is None:
        import urllib.request

        with urllib.request.urlopen(imgs[0], timeout=120) as r:
            data = r.read()

    out = OUT_DIR / (stem + sniff_ext(data))
    out.write_bytes(data)

    im = Image.open(io.BytesIO(data))
    im.verify()
    im = Image.open(io.BytesIO(data))
    print(f"WROTE {out}  format={im.format} size={im.size} bytes={len(data)}")


if __name__ == "__main__":
    main()
