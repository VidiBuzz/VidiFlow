#!/usr/bin/env python
"""Install the regenerated 2560x1440 landing assets as optimised JPEGs.

- sniffs real magic bytes (the generator emits mislabelled containers)
- re-encodes PNG -> JPEG q85 (progressive) so the payload stays sane
- deletes cta-light.jpg (invisible: rendered under a 0.72-0.93 veil at opacity 0.4)
- prints measured dimensions + byte counts for every asset
"""
import io
import os
import pathlib

from PIL import Image

IMG = pathlib.Path(r"M:\code\vidismart\landing\assets\img")

PAIRS = [
    ("_cand-hero.png", "hero-fleet.jpg"),
    ("_cand-split.png", "split-lanes.jpg"),
    ("_cand-stack.png", "stack-surfaces.jpg"),
]


def install(src, dst):
    data = (IMG / src).read_bytes()
    im = Image.open(io.BytesIO(data))
    im.load()
    assert im.size == (2560, 1440), f"{src} is {im.size}, expected 2560x1440"
    rgb = im.convert("RGB")
    out = IMG / dst
    rgb.save(out, "JPEG", quality=85, optimize=True, progressive=True, subsampling=1)
    print(f"  {dst:20s} {rgb.size[0]}x{rgb.size[1]}  {out.stat().st_size:>9,} bytes")


print("installed:")
for s, d in PAIRS:
    install(s, d)

cta = IMG / "cta-light.jpg"
if cta.exists():
    n = cta.stat().st_size
    cta.unlink()
    print(f"deleted: cta-light.jpg ({n:,} bytes)")

for c in list(IMG.glob("_cand-*.png")):
    c.unlink()
    print(f"removed scratch: {c.name}")

print("\nfinal assets/img/:")
for f in sorted(os.listdir(IMG)):
    p = IMG / f
    im = Image.open(p)
    print(f"  {f:20s} {im.format:4s} {im.size[0]}x{im.size[1]}  {p.stat().st_size:>9,} bytes")
