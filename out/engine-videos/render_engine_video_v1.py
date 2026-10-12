#!/usr/bin/env python3
"""VidiFlow engine explainer renderer.
Script JSON -> edge-tts narration + PIL overlay layers + ffmpeg motion -> 1920x1080 mp4.
All words on screen are real overlays (never drawn by a generative model).
Usage: render_engine_video.py scripts/hermes-agent.json [--assets DIR] [--out DIR]
"""
import json, subprocess, sys, os, asyncio, argparse, shutil, textwrap
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1920, 1080, 30
BG = (7, 9, 15)
TEXT = (241, 245, 249)
MUTED = (148, 163, 184)
BLUE = (91, 140, 255)
FONT_DIR = "/usr/share/fonts/truetype/sand-box/google"
INTER = f"{FONT_DIR}/Inter/Inter-VariableFont_opsz,wght.ttf"
GROT = f"{FONT_DIR}/Space Grotesk/SpaceGrotesk-VariableFont_wght.ttf"
VOICE = "en-US-AndrewMultilingualNeural"

def font(path, size, weight="Regular"):
    f = ImageFont.truetype(path, size)
    try: f.set_variation_by_name(weight)
    except Exception: pass
    return f

def hexrgb(h):
    h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-3000:]); raise SystemExit(f"command failed: {cmd[0]}")
    return r.stdout

def dur(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).strip())

async def tts(text, path, voice):
    import edge_tts
    await edge_tts.Communicate(text, voice, rate="+10%").save(path)

def layer():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def glass(d, box, accent, r=28, alpha=150):
    d.rounded_rectangle(box, r, fill=(12, 16, 28, alpha), outline=accent + (110,), width=2)

def kicker(d, x, y, text, accent):
    f = font(GROT, 26, "Medium")
    d.rounded_rectangle((x, y, x + d.textlength(text.upper(), font=f) + 40, y + 46), 23, fill=accent + (40,), outline=accent + (160,), width=2)
    d.text((x + 20, y + 8), text.upper(), font=f, fill=accent + (255,))

def brand(d, accent):
    f = font(GROT, 26, "Bold")
    d.ellipse((80, H - 78, 98, H - 60), fill=BLUE + (255,))
    d.text((112, H - 86), "VidiFlow", font=f, fill=TEXT + (230,))
    f2 = font(INTER, 22, "Regular")
    d.text((240, H - 82), "agent stacks for business at scale", font=f2, fill=MUTED + (220,))

def caption_layer(text, accent):
    im = layer(); d = ImageDraw.Draw(im)
    f = font(INTER, 30, "Medium")
    lines = wrap(d, text, f, 1300)[:3]
    lh = 42; h = lh * len(lines) + 30
    y0 = H - 150 - h
    wmax = max(d.textlength(l, font=f) for l in lines)
    x0 = (W - wmax) / 2 - 28
    d.rounded_rectangle((x0, y0, x0 + wmax + 56, y0 + h), 18, fill=(0, 0, 0, 165))
    for i, l in enumerate(lines):
        d.text(((W - d.textlength(l, font=f)) / 2, y0 + 15 + i * lh), l, font=f, fill=(255, 255, 255, 245))
    return im

def paste_fit(im, src, box, radius=20):
    x0, y0, x1, y1 = box
    s = Image.open(src).convert("RGBA")
    s.thumbnail((x1 - x0, y1 - y0), Image.LANCZOS)
    m = Image.new("L", s.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, s.size[0], s.size[1]), radius, fill=255)
    px, py = x0 + (x1 - x0 - s.size[0]) // 2, y0 + (y1 - y0 - s.size[1]) // 2
    im.paste(s, (px, py), m)
    return (px, py, px + s.size[0], py + s.size[1])

def scene_layers(sc, spec, A):
    """Return list of (RGBA image, appear_time_fraction) layers for one scene."""
    accent = hexrgb(spec["accent"])
    out = []
    t = sc["type"]
    base = layer(); d = ImageDraw.Draw(base); brand(d, accent); out.append((base, 0.0))
    if t == "title":
        im = layer(); d = ImageDraw.Draw(im)
        kicker(d, 130, 300, sc.get("kicker", "VidiFlow Integrate"), accent)
        tx = 320 if spec.get("logo") else 130
        if spec.get("logo"):
            lg = layer(); dd = ImageDraw.Draw(lg)
            dd.rounded_rectangle((130, 380, 290, 540), 32, fill=(255, 255, 255, 235))
            paste_fit(lg, os.path.join(A, spec["logo"]), (150, 400, 270, 520), 12)
            out.append((lg, 0.05))
        f = font(GROT, 112, "Bold")
        d.text((tx, 392), sc["title"], font=f, fill=TEXT + (255,))
        out.append((im, 0.0))
        s = layer(); d = ImageDraw.Draw(s); f2 = font(INTER, 40, "Regular")
        for i, l in enumerate(wrap(d, sc["sub"], f2, 1100)):
            d.text((134, 590 + i * 56), l, font=f2, fill=MUTED + (255,))
        out.append((s, 0.2))
    elif t in ("what", "vidiflow"):
        im = layer(); d = ImageDraw.Draw(im)
        kicker(d, 110, 110, sc["heading"], accent)
        out.append((im, 0.0))
        right = sc.get("image") or (spec.get("shot") if t == "what" else None)
        textw = 860 if right else 1500
        if right:
            fr = layer(); dd = ImageDraw.Draw(fr)
            glass(dd, (1060, 190, 1810, 790), accent, alpha=190)
            paste_fit(fr, os.path.join(A, right), (1085, 215, 1785, 765), 16)
            out.append((fr, 0.05))
        fb = font(INTER, 44, "SemiBold"); y = 230
        n = len(sc["bullets"])
        for i, b in enumerate(sc["bullets"]):
            bl = layer(); d = ImageDraw.Draw(bl)
            lines = wrap(d, b, fb, textw - 70)
            h = 56 * len(lines) + 40
            glass(d, (110, y, 110 + textw, y + h), accent, r=22, alpha=140)
            d.ellipse((140, y + 34, 160, y + 54), fill=accent + (255,))
            for j, l in enumerate(lines):
                d.text((185, y + 20 + j * 56), l, font=fb, fill=TEXT + (255,))
            out.append((bl, 0.08 + 0.75 * i / max(n, 1)))
            y += h + 26
    elif t == "how":
        im = layer(); d = ImageDraw.Draw(im)
        kicker(d, 110, 110, sc["heading"], accent); out.append((im, 0.0))
        steps = sc["steps"]; n = len(steps)
        gap = 60; bw = (W - 220 - gap * (n - 1)) / n; y0, y1 = 330, 700
        for i, st in enumerate(steps):
            bl = layer(); d = ImageDraw.Draw(bl)
            x0 = 110 + i * (bw + gap)
            glass(d, (x0, y0, x0 + bw, y1), accent, alpha=170)
            fn = font(GROT, 64, "Bold"); d.text((x0 + 36, y0 + 30), f"{i+1:02d}", font=fn, fill=accent + (255,))
            ft = font(GROT, 44, "Bold"); fd = font(INTER, 32, "Regular")
            ty = y0 + 130
            for l in wrap(d, st[0], ft, bw - 72):
                d.text((x0 + 36, ty), l, font=ft, fill=TEXT + (255,)); ty += 54
            ty += 12
            for l in wrap(d, st[1], fd, bw - 72):
                d.text((x0 + 36, ty), l, font=fd, fill=MUTED + (255,)); ty += 44
            if i < n - 1:
                ax = x0 + bw + 10; ay = (y0 + y1) / 2
                d.line((ax, ay, ax + gap - 20, ay), fill=accent + (255,), width=5)
                d.polygon([(ax + gap - 20, ay - 12), (ax + gap - 4, ay), (ax + gap - 20, ay + 12)], fill=accent + (255,))
            out.append((bl, 0.06 + 0.7 * i / n))
    elif t == "timeline":
        im = layer(); d = ImageDraw.Draw(im)
        kicker(d, 110, 110, sc["heading"], accent)
        d.line((160, 540, W - 160, 540), fill=accent + (150,), width=4)
        out.append((im, 0.0))
        items = sc["items"]; n = len(items)
        for i, (date, label) in enumerate(items):
            bl = layer(); d = ImageDraw.Draw(bl)
            x = 160 + (W - 320) * (i / (n - 1) if n > 1 else 0.5)
            d.ellipse((x - 16, 524, x + 16, 556), fill=accent + (255,), outline=(255, 255, 255, 255), width=3)
            fd = font(GROT, 40, "Bold"); fl = font(INTER, 30, "Regular")
            up = i % 2 == 0
            lines = wrap(d, label, fl, 360)
            colw = max([d.textlength(date, font=fd)] + [d.textlength(l, font=fl) for l in lines])
            tx = min(max(x - colw / 2, 110), W - 110 - colw)
            ty = 300 if up else 600
            d.text((tx, ty), date, font=fd, fill=TEXT + (255,))
            for j, l in enumerate(lines):
                d.text((tx, ty + 56 + j * 40), l, font=fl, fill=MUTED + (255,))
            out.append((bl, 0.06 + 0.75 * i / n))
    elif t == "end":
        im = layer(); d = ImageDraw.Draw(im)
        f = font(GROT, 120, "Bold"); f2 = font(INTER, 44, "Regular")
        ttl = sc.get("title", "VidiFlow")
        d.text(((W - d.textlength(ttl, font=f)) / 2, 380), ttl, font=f, fill=TEXT + (255,))
        sub = sc.get("sub", "Agent stacks that run your business at scale.")
        d.text(((W - d.textlength(sub, font=f2)) / 2, 540), sub, font=f2, fill=MUTED + (255,))
        d.rounded_rectangle((W / 2 - 60, 640, W / 2 + 60, 646), 3, fill=accent + (255,))
        out = [(im, 0.0)]
    return out

def build_scene(i, sc, spec, A, work, voice, captions):
    accent = hexrgb(spec["accent"])
    mp3 = f"{work}/s{i}.mp3"
    asyncio.run(tts(sc["say"], mp3, voice))
    d = dur(mp3) + 0.7
    layers = scene_layers(sc, spec, A)
    files = []
    for k, (im, frac) in enumerate(layers):
        p = f"{work}/s{i}_l{k}.png"; im.save(p); files.append((p, frac * min(d - 1.0, 4.0)))
    if captions and sc["type"] != "end":
        p = f"{work}/s{i}_cap.png"; caption_layer(sc["say"], accent).save(p); files.append((p, 0.25))
    # background: b-roll still with slow push-in, darkened; end card / plain fall back to gradient
    bgsrc = os.path.join(A, spec["broll"]) if spec.get("broll") and os.path.exists(os.path.join(A, spec["broll"])) else None
    frames = int(d * FPS) + 1
    inputs = []
    if bgsrc:
        inputs += ["-loop", "1", "-t", f"{d:.3f}", "-i", bgsrc]
        z = "1.0+0.00045*on" if i % 2 == 0 else "1.12-0.00045*on"
        bgf = (f"[0:v]scale=2304:1296:force_original_aspect_ratio=increase,crop=2304:1296,"
               f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={W}x{H}:fps={FPS},"
               f"eq=brightness=-0.10:saturation=1.05,format=rgba")
        if sc["type"] in ("what", "how", "timeline", "vidiflow", "end"):
            bgf += ",gblur=sigma=6,eq=brightness=-0.12"
        bgf += "[bg]"
    else:
        inputs += ["-f", "lavfi", "-t", f"{d:.3f}", "-i", f"color=c=0x07090f:s={W}x{H}:r={FPS}"]
        bgf = "[0:v]format=rgba[bg]"
    # dark vignette gradient so overlay text always reads
    vg = Image.new("RGBA", (W, H)); vd = ImageDraw.Draw(vg)
    for x in range(W):
        a = int(200 * max(0, 1 - x / (W * 0.75)) ** 1.3)
        vd.line((x, 0, x, H), fill=(7, 9, 15, a))
    vp = f"{work}/s{i}_vig.png"; vg.save(vp)
    files.insert(0, (vp, 0.0))
    fc = [bgf]; last = "bg"
    for k, (p, t0) in enumerate(files):
        inputs += ["-loop", "1", "-t", f"{d:.3f}", "-i", p]
        idx = k + 1
        fade = f"fade=t=in:st={t0:.2f}:d=0.45:alpha=1" if t0 > 0 or k > 1 else "null"
        fc.append(f"[{idx}:v]format=rgba,{fade}[o{k}]")
        fc.append(f"[{last}][o{k}]overlay=0:0:format=auto[v{k}]"); last = f"v{k}"
    fc.append(f"[{last}]fade=t=in:st=0:d=0.35,fade=t=out:st={d-0.35:.2f}:d=0.35,format=yuv420p[vout]")
    inputs += ["-i", mp3]
    aidx = len(files) + 1
    fc.append(f"[{aidx}:a]adelay=300|300,apad,atrim=0:{d:.3f},aresample=48000[aout]")
    out = f"{work}/s{i}.mp4"
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(fc), "-map", "[vout]", "-map", "[aout]",
         "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-r", str(FPS), "-c:a", "aac", "-b:a", "160k", "-t", f"{d:.3f}", out])
    return out, d

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script"); ap.add_argument("--assets", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets"))
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "out"))
    ap.add_argument("--voice", default=VOICE); ap.add_argument("--no-captions", action="store_true")
    a = ap.parse_args()
    spec = json.load(open(a.script))
    work = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(a.out)), "work", spec["id"])); os.makedirs(work, exist_ok=True); os.makedirs(a.out, exist_ok=True)
    parts = []; total = 0
    for i, sc in enumerate(spec["scenes"]):
        p, d = build_scene(i, sc, spec, a.assets, work, a.voice, not a.no_captions); parts.append(p); total += d
        print(f"scene {i} {sc['type']} {d:.1f}s")
    lst = f"{work}/list.txt"; open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    final = os.path.join(a.out, f"{spec['id']}.mp4")
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", final])
    print(f"done {final} {total:.1f}s")

if __name__ == "__main__":
    main()
