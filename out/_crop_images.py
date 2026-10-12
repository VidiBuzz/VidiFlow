from PIL import Image, ImageOps
import os

d = r"M:\code\VidiFlow\out\images"
bias = {"hero.png": (0.5, 0.32)}   # keep the skull/head fully in frame
for name in sorted(os.listdir(d)):
    if not name.endswith(".png") or name.startswith("_"):
        continue
    p = os.path.join(d, name)
    im = Image.open(p).convert("RGB")
    if im.size == (1024, 576):
        print(name, "already 16:9")
        continue
    out = ImageOps.fit(im, (1024, 576), method=Image.LANCZOS, centering=bias.get(name, (0.5, 0.5)))
    out.save(p, optimize=True)
    print(name, im.size, "->", out.size)
