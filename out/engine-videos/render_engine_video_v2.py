#!/usr/bin/env python3
"""VidiFlow engine explainer renderer, v2 (2026-10-11).

Script JSON -> TTS narration (one continuous track) + PIL overlay layers + one continuous
background push-in, frames piped to ffmpeg -> 1920x1080 H.264/AAC mp4.

v2 changes: no fade-to-black between scenes (only overlays cross-dissolve over a single
continuous background push-in); continuous narration with short sentence/scene pauses;
ink-measured badges/labels; every text box kept inside a 96 px safe area; auto-fit "how"
boxes; automated per-scene safe-area check (aborts the render on any violation).
All words on screen are real overlays, never drawn by a generative model.

Usage: render_engine_video.py scripts/<id>.json [--assets DIR] [--out DIR]
       [--voice edge:en-US-AvaMultilingualNeural | kokoro:af_heart] [--check-only] [--no-captions]
"""
import json, subprocess, sys, os, asyncio, argparse, re
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

W, H, FPS = 1920, 1080, 30
SAFE = 96
BG = (7, 9, 15); TEXT = (241, 245, 249); MUTED = (148, 163, 184); BLUE = (91, 140, 255)
FONT_DIR = "/usr/share/fonts/truetype/sand-box/google"
INTER = f"{FONT_DIR}/Inter/Inter-VariableFont_opsz,wght.ttf"
GROT = f"{FONT_DIR}/Space Grotesk/SpaceGrotesk-VariableFont_wght.ttf"
HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_VOICE = "edge:en-US-AvaMultilingualNeural"
EDGE_RATE = "+8%"; KOKORO_SPEED = 1.06
SENT_GAP, SCENE_GAP = 0.22, 0.45      # pauses (s): between sentences / between scenes
LEAD, TAIL, XF = 0.6, 0.9, 0.6        # narration start, end hold, overlay cross-dissolve
CAPTION_TOP_LIMIT = 780               # content must end above the caption band
ZOOM_END = 1.16                       # background push-in over the whole video

_fonts = {}
def font(path, size, weight="Regular"):
    k = (path, size, weight)
    if k not in _fonts:
        f = ImageFont.truetype(path, size)
        try: f.set_variation_by_name(weight)
        except Exception: pass
        _fonts[k] = f
    return _fonts[k]

def hexrgb(h): h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def run(cmd, inp=None):
    r = subprocess.run(cmd, capture_output=True, input=inp)
    if r.returncode != 0:
        sys.stderr.write(r.stderr.decode(errors="ignore")[-3000:]); raise SystemExit(f"command failed: {cmd[0]}")
    return r.stdout

# ---------------------------------------------------------------- text + layout helpers
_md = ImageDraw.Draw(Image.new("L", (8, 8)))
def ink(s, f):  # ink bbox at origin (left, top, right, bottom)
    return _md.textbbox((0, 0), s, font=f)
def tw(s, f): b = ink(s, f); return b[2] - b[0]

def wrap(text, f, maxw):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if tw(t, f) <= maxw or not cur: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

class Canvas:
    """RGBA layer that records every text ink box (and its container) for the safe-area check."""
    def __init__(self, name):
        self.name = name; self.im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); self.d = ImageDraw.Draw(self.im); self.texts = []
    def text(self, xy, s, f, fill, container=None, anchor="la"):
        self.d.text(xy, s, font=f, fill=fill, anchor=anchor)
        self.texts.append((s, self.d.textbbox(xy, s, font=f, anchor=anchor), container))
    def glass(self, box, accent, r=28, alpha=150):
        self.d.rounded_rectangle(box, r, fill=(12, 16, 28, alpha), outline=accent + (110,), width=2)

def kicker(c, x, y, text, accent):
    f = font(GROT, 26, "Medium"); t = text.upper(); b = ink(t, f)
    px, py = 26, 13
    box = (x, y, x + (b[2] - b[0]) + 2 * px, y + (b[3] - b[1]) + 2 * py)
    c.d.rounded_rectangle(box, (box[3] - box[1]) // 2, fill=accent + (40,), outline=accent + (160,), width=2)
    c.text((x + px - b[0], y + py - b[1]), t, f, accent + (255,), container=box)
    return box

def paste_fit(im, src, box, radius=20):
    x0, y0, x1, y1 = box
    s = Image.open(src).convert("RGBA"); s.thumbnail((x1 - x0, y1 - y0), Image.LANCZOS)
    m = Image.new("L", s.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, s.size[0], s.size[1]), radius, fill=255)
    im.paste(s, (x0 + (x1 - x0 - s.size[0]) // 2, y0 + (y1 - y0 - s.size[1]) // 2), m)

def chrome_layer():
    c = Canvas("brand"); f = font(GROT, 26, "Bold"); f2 = font(INTER, 22, "Regular")
    base = H - SAFE - 14
    c.d.ellipse((SAFE + 4, base - 21, SAFE + 22, base - 3), fill=BLUE + (255,))
    c.text((SAFE + 34, base), "VidiFlow", f, TEXT + (230,), anchor="ls")
    c.text((SAFE + 34 + tw("VidiFlow", f) + 18, base), "agent stacks for business at scale", f2, MUTED + (220,), anchor="ls")
    return c

def caption_layer(text):
    c = Canvas("caption"); f = font(INTER, 30, "Medium")
    lines = wrap(text, f, 1300)[:3]; lh = 42; h = lh * len(lines) + 30
    bottom = H - SAFE - 52; y0 = bottom - h
    wmax = max(tw(l, f) for l in lines); x0 = (W - wmax) / 2 - 28
    box = (x0, y0, x0 + wmax + 56, bottom)
    c.d.rounded_rectangle(box, 18, fill=(0, 0, 0, 165))
    for i, l in enumerate(lines):
        c.text(((W - tw(l, f)) / 2 - ink(l, f)[0], y0 + 15 + i * lh), l, f, (255, 255, 255, 245), container=box)
    return c

# ---------------------------------------------------------------- scene layouts
def scene_layers(sc, spec, A):
    """[(Canvas, reveal_fraction)] for one scene."""
    accent = hexrgb(spec["accent"]); out = []; t = sc["type"]
    if t == "title":
        c = Canvas("title"); kicker(c, 130, 300, sc.get("kicker", "VidiFlow Integrate"), accent)
        tx = 130
        if spec.get("logo"):
            lg = Canvas("logo"); lg.d.rounded_rectangle((130, 380, 290, 540), 32, fill=(255, 255, 255, 235))
            paste_fit(lg.im, os.path.join(A, spec["logo"]), (150, 400, 270, 520), 12); out.append((lg, 0.05)); tx = 320
        size = 112
        while tw(sc["title"], font(GROT, size, "Bold")) > W - SAFE - tx and size > 60: size -= 4
        c.text((tx, 392), sc["title"], font(GROT, size, "Bold"), TEXT + (255,))
        out.insert(0, (c, 0.0))
        s = Canvas("subtitle"); f2 = font(INTER, 40, "Regular")
        for i, l in enumerate(wrap(sc["sub"], f2, 1100)):
            s.text((134, 590 + i * 56), l, f2, MUTED + (255,))
        out.append((s, 0.2))
    elif t in ("what", "vidiflow"):
        c = Canvas("heading"); kicker(c, 110, 110, sc["heading"], accent); out.append((c, 0.0))
        right = sc.get("image") or (spec.get("shot") if t == "what" else None)
        textw = 860 if right else 1500
        if right:
            fr = Canvas("frame"); fr.glass((1060, 190, 1810, 760), accent, alpha=190)
            paste_fit(fr.im, os.path.join(A, right), (1085, 215, 1785, 735), 16); out.append((fr, 0.05))
        size = 44
        while True:
            fb = font(INTER, size, "SemiBold"); lh = int(size * 1.27); y = 230; boxes = []
            for b in sc["bullets"]:
                lines = wrap(b, fb, textw - 100); h = lh * len(lines) + 44; boxes.append((y, lines, h)); y += h + 24
            if y - 24 <= CAPTION_TOP_LIMIT or size <= 30: break
            size -= 2
        n = len(boxes)
        for i, (y, lines, h) in enumerate(boxes):
            bl = Canvas(f"bullet{i}"); box = (110, y, 110 + textw, y + h); bl.glass(box, accent, r=22, alpha=140)
            bl.d.ellipse((140, y + 22 + lh // 2 - 10, 160, y + 22 + lh // 2 + 10), fill=accent + (255,))
            for j, l in enumerate(lines):
                bl.text((185, y + 22 + j * lh + lh // 2), l, fb, TEXT + (255,), container=box, anchor="lm")
            out.append((bl, 0.08 + 0.75 * i / max(n, 1)))
    elif t == "how":
        c = Canvas("heading"); kicker(c, 110, 110, sc["heading"], accent); out.append((c, 0.0))
        steps = sc["steps"]; n = len(steps); gap = 60; bw = (W - 220 - gap * (n - 1)) / n; y0 = 300
        pad = 36; ts, ds = 44, 32
        while True:
            ft = font(GROT, ts, "Bold"); fd = font(INTER, ds, "Regular"); tl, dl = int(ts * 1.22), int(ds * 1.38)
            lay = [(wrap(st[0], ft, bw - 2 * pad), wrap(st[1], fd, bw - 2 * pad)) for st in steps]
            need = max(30 + 70 + 26 + len(a) * tl + 14 + len(b) * dl + 44 for a, b in lay)
            boxh = max(need, 340)
            if y0 + boxh <= CAPTION_TOP_LIMIT or ds <= 24: break
            ts -= 2; ds -= 2
        y1 = y0 + boxh
        for i, (tlines, dlines) in enumerate(lay):
            bl = Canvas(f"step{i}"); x0 = 110 + i * (bw + gap); box = (x0, y0, x0 + bw, y1)
            bl.glass(box, accent, alpha=170)
            bl.text((x0 + pad, y0 + 30), f"{i+1:02d}", font(GROT, 64, "Bold"), accent + (255,), container=box)
            ty = y0 + 30 + 70 + 26
            for l in tlines: bl.text((x0 + pad, ty), l, ft, TEXT + (255,), container=box); ty += tl
            ty += 14
            for l in dlines: bl.text((x0 + pad, ty), l, fd, MUTED + (255,), container=box); ty += dl
            if i < n - 1:
                ax = x0 + bw + 10; ay = (y0 + y1) / 2
                bl.d.line((ax, ay, ax + gap - 20, ay), fill=accent + (255,), width=5)
                bl.d.polygon([(ax + gap - 20, ay - 12), (ax + gap - 4, ay), (ax + gap - 20, ay + 12)], fill=accent + (255,))
            out.append((bl, 0.06 + 0.7 * i / n))
    elif t == "timeline":
        c = Canvas("heading"); kicker(c, 110, 110, sc["heading"], accent)
        c.d.line((180, 540, W - 180, 540), fill=accent + (150,), width=4); out.append((c, 0.0))
        items = sc["items"]; n = len(items); fd = font(GROT, 40, "Bold"); fl = font(INTER, 30, "Regular")
        lo, hi = SAFE + 22, W - SAFE - 22   # label backing pad stays inside the safe area
        for i, (date, label) in enumerate(items):
            bl = Canvas(f"node{i}")
            x = 180 + (W - 360) * (i / (n - 1) if n > 1 else 0.5)
            bl.d.ellipse((x - 16, 524, x + 16, 556), fill=accent + (255,), outline=(255, 255, 255, 255), width=3)
            ls_ = 30
            while True:
                fl = font(INTER, ls_, "Regular"); lines = wrap(label, fl, 380); hgt = 56 + 40 * len(lines)
                if hgt <= 230 or ls_ <= 22: break
                ls_ -= 2
            colw = max([tw(date, fd)] + [tw(l, fl) for l in lines])
            align = "center" if 0 < i < n - 1 or n == 1 else ("left" if i == 0 else "right")
            tx = {"left": x - 30, "right": x + 30 - colw, "center": x - colw / 2}[align]
            tx = min(max(tx, lo), hi - colw)
            ty = 506 - hgt if i % 2 == 0 else 590   # labels never cross the timeline rail
            back = (tx - 20, ty - 16, tx + colw + 20, ty + hgt + 6)
            bl.d.rounded_rectangle(back, 16, fill=(7, 9, 15, 150))
            def ax(s, f): return {"left": tx, "right": tx + colw - tw(s, f), "center": tx + (colw - tw(s, f)) / 2}[align] - ink(s, f)[0]
            bl.text((ax(date, fd), ty), date, fd, TEXT + (255,), container=back)
            for j, l in enumerate(lines):
                bl.text((ax(l, fl), ty + 56 + j * 40), l, fl, MUTED + (255,), container=back)
            out.append((bl, 0.06 + 0.75 * i / n))
    elif t == "end":
        c = Canvas("end"); f = font(GROT, 120, "Bold"); f2 = font(INTER, 44, "Regular")
        ttl = sc.get("title", "VidiFlow"); sub = sc.get("sub", "Agent stacks that run your business at scale.")
        c.text(((W - tw(ttl, f)) / 2 - ink(ttl, f)[0], 380), ttl, f, TEXT + (255,))
        c.text(((W - tw(sub, f2)) / 2 - ink(sub, f2)[0], 540), sub, f2, MUTED + (255,))
        c.d.rounded_rectangle((W / 2 - 60, 640, W / 2 + 60, 646), 3, fill=accent + (255,))
        out.append((c, 0.0))
    return out

def safe_check(scene_idx, canvases):
    """Pixel + text-box check: every layer's drawn pixels and every text ink box inside the
    96 px safe area; every contained text inside its box with 8 px clearance."""
    errs = []
    for c in canvases:
        bb = c.im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
        if bb and (bb[0] < SAFE or bb[1] < SAFE or bb[2] > W - SAFE or bb[3] > H - SAFE):
            errs.append(f"scene {scene_idx} layer '{c.name}' pixels {bb} outside safe area")
        for s, b, box in c.texts:
            if b[0] < SAFE or b[1] < SAFE or b[2] > W - SAFE or b[3] > H - SAFE:
                errs.append(f"scene {scene_idx} '{s}' ink {b} outside safe area")
            if box and (b[0] < box[0] + 8 or b[1] < box[1] + 6 or b[2] > box[2] - 8 or b[3] > box[3] - 6):
                errs.append(f"scene {scene_idx} '{s}' ink {tuple(map(int,b))} touches/exceeds its box {tuple(map(int,box))}")
    boxes = [(c.name, s, b) for c in canvases for s, b, _ in c.texts]
    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            (n1, s1, a), (n2, s2, b) = boxes[i], boxes[j]
            if n1 != n2 and a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]:
                errs.append(f"scene {scene_idx} text '{s1}' ({n1}) overlaps '{s2}' ({n2})")
    return errs

# ---------------------------------------------------------------- narration
def sentences(t): return [s.strip() for s in re.split(r"(?<=[.!?])\s+", t.strip()) if s.strip()]

def synth(sentence, voice, path_raw):
    kind, name = voice.split(":", 1)
    tmp = path_raw + (".mp3" if kind == "edge" else ".wav")
    if kind == "edge":
        import edge_tts
        asyncio.run(edge_tts.Communicate(sentence, name, rate=EDGE_RATE).save(tmp))
    else:
        global _kokoro
        if "_kokoro" not in globals():
            from kokoro_onnx import Kokoro
            _kokoro = Kokoro(os.path.join(HERE, "models/kokoro-v1.0.onnx"), os.path.join(HERE, "models/voices-v1.0.bin"))
        import soundfile as sf
        s, sr = _kokoro.create(sentence, voice=name, speed=KOKORO_SPEED, lang="en-us"); sf.write(tmp, s, sr)
    trim = ("silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.03,areverse,"
            "silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.06,areverse,"
            "afade=t=in:d=0.02")
    return run(["ffmpeg", "-v", "error", "-i", tmp, "-af", trim, "-ar", "48000", "-ac", "1", "-f", "s16le", "-"])

def build_audio(spec, voice, work):
    """One continuous track; returns (pcm bytes, [(narration_start, narration_end)] per scene)."""
    sr = 48000; bps = 2
    def sil(sec): return b"\x00\x00" * int(sec * sr)
    pcm = bytearray(sil(LEAD)); spans = []
    for i, sc in enumerate(spec["scenes"]):
        if i: pcm += sil(SCENE_GAP)
        st = len(pcm) / bps / sr
        for j, s in enumerate(sentences(sc["say"])):
            if j: pcm += sil(SENT_GAP)
            pcm += synth(s, voice, f"{work}/a{i}_{j}")
        spans.append((st, len(pcm) / bps / sr))
    pcm += sil(TAIL)
    return bytes(pcm), spans

# ---------------------------------------------------------------- compositing
def scale_alpha(im, a):
    if a >= 0.999: return im
    r, g, b, al = im.split(); return Image.merge("RGBA", (r, g, b, al.point(lambda v: int(v * a))))

def ramp(x): return 0.0 if x <= 0 else 1.0 if x >= 1 else x * x * (3 - 2 * x)  # smoothstep

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script"); ap.add_argument("--assets", default=os.path.join(HERE, "assets"))
    ap.add_argument("--out", default=os.path.join(HERE, "out")); ap.add_argument("--voice", default=DEFAULT_VOICE)
    ap.add_argument("--no-captions", action="store_true"); ap.add_argument("--check-only", action="store_true")
    a = ap.parse_args()
    spec = json.load(open(a.script)); sid = spec["id"]
    work = os.path.join(HERE, "work", sid); chk = os.path.join(HERE, "check", sid)
    os.makedirs(work, exist_ok=True); os.makedirs(chk, exist_ok=True); os.makedirs(a.out, exist_ok=True)
    accent = hexrgb(spec["accent"])

    # layers + automated safe-area check
    chrome = chrome_layer(); scenes = []; errs = safe_check("brand", [chrome])
    for i, sc in enumerate(spec["scenes"]):
        L = scene_layers(sc, spec, a.assets)
        if not a.no_captions and sc["type"] != "end": L.append((caption_layer(sc["say"]), 0.1))
        errs += safe_check(i, [c for c, _ in L]); scenes.append(L)

    # background: one image, one continuous push-in, sharp<->blurred per scene
    bsrc = os.path.join(a.assets, spec.get("broll", ""))
    src = Image.open(bsrc).convert("RGB") if spec.get("broll") and os.path.exists(bsrc) else Image.new("RGB", (W, H), BG)
    BW, BH = int(W * 1.2), int(H * 1.2)
    s = max(BW / src.width, BH / src.height); src = src.resize((int(src.width * s + 1), int(src.height * s + 1)), Image.LANCZOS)
    l, t = (src.width - BW) // 2, (src.height - BH) // 2; src = src.crop((l, t, l + BW, t + BH))
    sharp = ImageEnhance.Brightness(src).enhance(0.88)
    blurred = ImageEnhance.Brightness(src.filter(ImageFilter.GaussianBlur(9))).enhance(0.6)
    blur_of = {"title": 0.0, "end": 0.75}
    vg = Image.new("RGBA", (W, H)); vd = ImageDraw.Draw(vg)
    for x in range(W): vd.line((x, 0, x, H), fill=BG + (int(200 * max(0, 1 - x / (W * 0.75)) ** 1.3),))

    def background(tsec, T, wblur):
        z = 1.0 + (ZOOM_END - 1.0) * (tsec / T)
        cw, ch = BW / z, BH / z; box = ((BW - cw) / 2, (BH - ch) / 2, (BW + cw) / 2, (BH + ch) / 2)
        f = sharp.resize((W, H), Image.BILINEAR, box=box)
        if wblur > 0.001: f = Image.blend(f, blurred.resize((W, H), Image.BILINEAR, box=box), wblur)
        return f.convert("RGBA")

    if a.check_only:
        spans = [(LEAD + 6.0 * i, LEAD + 6.0 * i + 5.0) for i in range(len(scenes))]; pcm = None
    else:
        pcm, spans = build_audio(spec, a.voice, work)
    n = len(scenes)
    starts = [0.0] + [(spans[i - 1][1] + spans[i][0]) / 2 for i in range(1, n)]
    T = spans[-1][1] + TAIL
    ends = starts[1:] + [T + 1]
    rev_end = []
    for i, L in enumerate(scenes):
        dur = ends[i] - starts[i]; rev_end.append([0.15 + fr * min(max(dur - 1.2, 0.5), 3.5) for _, fr in L])

    cache = {}
    def scene_img(i, tau):
        rs = tuple(int(round(ramp((tau - t0) / 0.45) * 24)) for t0 in rev_end[i])
        k = (i, rs)
        if k not in cache:
            im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            for (c, _), r in zip(scenes[i], rs):
                if r: im.alpha_composite(scale_alpha(c.im, r / 24))
            if len(cache) > 400: cache.clear()
            cache[k] = im
        return cache[k]

    def scene_alpha(i, tsec):
        up = 1.0 if i == 0 else ramp((tsec - (starts[i] - XF / 2)) / XF)
        if i == 0: up = ramp((tsec - 0.15) / 0.5)
        down = 1.0 if i == n - 1 else 1 - ramp((tsec - (ends[i] - XF / 2)) / XF)
        return up * down

    def frame(tsec):
        alphas = [scene_alpha(i, tsec) for i in range(n)]
        tot = sum(alphas) or 1
        wblur = sum(al * blur_of.get(spec["scenes"][i]["type"], 1.0) for i, al in enumerate(alphas)) / tot
        f = background(tsec, T, wblur); f.alpha_composite(vg)
        ca = 1.0 - alphas[-1] if spec["scenes"][-1]["type"] == "end" else 1.0
        f.alpha_composite(scale_alpha(chrome.im, ca))
        for i, al in enumerate(alphas):
            if al > 0.004: f.alpha_composite(scale_alpha(scene_img(i, tsec - starts[i]), al))
        g = min(1.0, tsec / 0.4, (T - tsec) / 0.6)   # fade from/to black only at the very start/end
        f = f.convert("RGB")
        if g < 1: f = Image.blend(Image.new("RGB", (W, H), (0, 0, 0)), f, max(g, 0))
        return f

    # one check frame per scene (fully revealed, no transition) + contact sheet
    shots = []
    for i in range(n):
        tc = min(starts[i] + max(rev_end[i]) + 0.6, ends[i] - XF / 2 - 0.05); tc = max(tc, starts[i] + 0.2)
        p = os.path.join(chk, f"scene{i}.png"); frame(tc).save(p); shots.append(p)
    sheet = Image.new("RGB", (960 * 2, 540 * ((n + 1) // 2)), (0, 0, 0))
    for i, p in enumerate(shots): sheet.paste(Image.open(p).resize((960, 540), Image.LANCZOS), ((i % 2) * 960, (i // 2) * 540))
    sheet.save(os.path.join(a.out, f"{sid}-contact-sheet.jpg"), quality=90)
    if errs:
        print("SAFE-AREA CHECK FAILED:"); [print("  " + e) for e in errs]; raise SystemExit(2)
    print(f"safe-area check passed: {n} scenes, frames in {chk}")
    if a.check_only: return

    wav = os.path.join(work, "narration.s16le"); open(wav, "wb").write(pcm)
    final = os.path.join(a.out, f"{sid}.mp4"); nframes = int(T * FPS)
    ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-f", "s16le", "-ar", "48000", "-ac", "1", "-i", wav,
                           "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000",
                           "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
                           "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", final], stdin=subprocess.PIPE)
    for k in range(nframes):
        ff.stdin.write(frame(k / FPS).tobytes())
    ff.stdin.close(); ff.wait()
    if ff.returncode: raise SystemExit("ffmpeg encode failed")
    print("scene starts: " + ", ".join(f"{x:.2f}" for x in starts))
    print(f"done {final} {T:.1f}s voice={a.voice}")

if __name__ == "__main__":
    main()
