from PIL import Image
import os, glob

d = r"M:\code\VidiFlow\vidiflow-demo-site\images"
files = sorted(glob.glob(os.path.join(d, "org-head-*.png")))
for f in files:
    try:
        im = Image.open(f)
        exif = im.getexif()
        small = im.convert("RGB").resize((32, 32))
        px = list(small.getdata())
        n = len(px)
        mean = [sum(p[i] for p in px) / n for i in range(3)]
        std = [(sum((p[i] - mean[i]) ** 2 for p in px) / n) ** 0.5 for i in range(3)]
        print(f"{os.path.basename(f):30s} {str(im.size):14s} {im.mode:6s} exif={len(exif)} mean={[round(x) for x in mean]} std={[round(x) for x in std]}")
    except Exception as e:
        print(f, "ERR", e)
