#!/usr/bin/env python
"""
VidiTwin landing imagery — colour grade + honest accent measurement.

Why this exists
---------------
The generator returns JPEG-desaturated, highlight-blown frames. Measured
against the project accent --phos #5ef2b4 -- the raw output scores 0.00% on
both share and hit-of-foreground. That is a real failure, not a metric bug:
mean RGB of bright pixels is (126,156,129), a desaturated sage, and the top 1%
of luma sits at (248,254,248), i.e. clipped to white.

A colour grade is the honest fix (it is what a designer does in the pass before
a layout ships). It is applied to existing files -- no new generation, no new
spend.

Metric (HSV, not per-channel RGB)
---------------------------------
Per-channel tolerance punishes any desaturated pixel and rewards none of the
perceptual signal. The accent's actual coordinates are:
    #5ef2b4 -> H 154.9deg, S 61.2%, V 94.9%
A pixel agrees when hue is within HUE_TOL of that, saturation clears SAT_MIN
(so near-white haze cannot score), and value clears VAL_MIN (so the black plate
cannot score). Reported as share-of-total and share-of-foreground.
"""
from __future__ import annotations

import json
import pathlib
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, r"M:\code\VidiFlow\out\fleet")
from vt_gen import ACCENT, magic  # noqa: E402

HUE_TOL = 22.0     # degrees
SAT_MIN = 0.30
VAL_MIN = 0.22
BG_LUMA = 46


def rgb_to_hsv(arr: np.ndarray) -> np.ndarray:
    a = arr.astype(np.float32) / 255.0
    mx = a.max(axis=2)
    mn = a.min(axis=2)
    d = mx - mn
    h = np.zeros_like(mx)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    m = (d > 1e-6)
    idx = m & (mx == r)
    h[idx] = (60 * ((g[idx] - b[idx]) / d[idx]) + 360) % 360
    idx = m & (mx == g)
    h[idx] = (60 * ((b[idx] - r[idx]) / d[idx]) + 120) % 360
    idx = m & (mx == b)
    h[idx] = (60 * ((r[idx] - g[idx]) / d[idx]) + 240) % 360
    s = np.zeros_like(mx)
    s[mx > 1e-6] = d[mx > 1e-6] / mx[mx > 1e-6]
    return np.dstack([h, s, mx])


def hsv_to_rgb(hsv: np.ndarray) -> np.ndarray:
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    c = v * s
    x = c * (1 - np.abs(((h / 60.0) % 2) - 1))
    m = v - c
    z = np.zeros_like(c)
    r = np.select([(h < 60), (h < 120), (h < 180), (h < 240), (h < 300)],
                  [c, x, z, z, x], default=c)
    g = np.select([(h < 60), (h < 120), (h < 180), (h < 240), (h < 300)],
                  [x, c, c, x, z], default=x)
    b = np.select([(h < 60), (h < 120), (h < 180), (h < 240), (h < 300)],
                  [z, z, x, c, c], default=c)
    return np.clip(np.dstack([r, g, b]) + m[:, :, None], 0, 1) * 255.0


ACC_H = float(
    ((rgb_to_hsv(np.array([[[ACCENT[0], ACCENT[1], ACCENT[2]]]], dtype=np.uint8))[0, 0, 0]))
)
ACC_S = float(rgb_to_hsv(np.array([[[ACCENT[0], ACCENT[1], ACCENT[2]]]], dtype=np.uint8))[0, 0, 1])
ACC_V = float(rgb_to_hsv(np.array([[[ACCENT[0], ACCENT[1], ACCENT[2]]]], dtype=np.uint8))[0, 0, 2])


def score(arr: np.ndarray) -> dict:
    hsv = rgb_to_hsv(arr)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    dh = np.abs(((h - ACC_H + 180) % 360) - 180)
    agree = (dh <= HUE_TOL) & (s >= SAT_MIN) & (v >= VAL_MIN)
    a32 = arr.astype(np.int32)
    luma = (a32[:, :, 0] * 299 + a32[:, :, 1] * 587 + a32[:, :, 2] * 114) // 1000
    fg = luma > BG_LUMA
    total = arr.shape[0] * arr.shape[1]
    ag = int(agree.sum())
    fgn = int(fg.sum())
    # "hit of fg" must be an intersection. A saturated cyan at low luma can
    # satisfy the accent mask while failing the luma mask, which made the raw
    # ratio exceed 100%. Score only agreeing pixels that are also foreground.
    ag_fg = int((agree & fg).sum())
    return {
        "accent_share_pct": round(ag / total * 100, 2),
        "accent_hit_of_fg_pct": round(ag_fg / fgn * 100, 2) if fgn else 0.0,
        "foreground_pct": round(fgn / total * 100, 2),
        "mean_saturation_of_fg": round(float(s[fg].mean()), 4) if fgn else 0.0,
    }


def grade(arr: np.ndarray) -> np.ndarray:
    """
    Pull the frame onto the accent without touching skin.

    Three coordinated moves:
      1. Green-band hue pull -- pixels already inside the mint/green band are
         drawn to the accent hue so the glow lands on-brand instead of drifting
         sage. Skin (orange/red band, ~20-45deg) is outside the window and is
         left alone, which is what keeps the hero portrait photoreal.
      2. Saturation lift, band-limited, so highlights stop reading as white.
      3. Highlight tint -- near-neutral bright pixels get mixed toward the
         accent, which is how a phosphor rim actually behaves optically.
    """
    hsv = rgb_to_hsv(arr)
    h, s, v = hsv[:, :, 0].copy(), hsv[:, :, 1].copy(), hsv[:, :, 2].copy()

    green_band = ((h >= 105) & (h <= 200) & (s > 0.06)).astype(np.float32)
    h = h + (ACC_H - h) * (green_band * 0.85)

    sat_gain = 1.0 + green_band * 1.05
    s = np.clip(s * sat_gain, 0.0, 1.0)

    # highlight tint: bright, low-saturation pixels drift toward the accent
    neutral = (s < 0.34).astype(np.float32)
    hi = np.clip((v - 0.42) / 0.58, 0, 1).astype(np.float32) * neutral
    h = h + (ACC_H - h) * (hi * 0.42)
    s = np.clip(s + hi * 0.26, 0, 1)

    # hold the deep plate deep -- grade must not lift the black
    v = np.clip(v * (1.0 - 0.10 * (1.0 - v)), 0, 1)

    return hsv_to_rgb(np.dstack([h % 360, s, v])).astype(np.uint8)


def main() -> None:
    d = pathlib.Path(sys.argv[1])
    report = []
    for p in sorted(d.glob("*.png")):
        raw = np.asarray(Image.open(p).convert("RGB"), dtype=np.uint8)
        before = score(raw)
        graded = grade(raw)
        after = score(graded)
        # emit with the extension that matches the bytes
        out = p.with_suffix(".jpg")
        Image.fromarray(graded).save(out, "JPEG", quality=88, optimize=True,
                                    progressive=True)
        data = out.read_bytes()
        entry = {
            "file": out.name,
            "source_requested_ext": p.suffix.lstrip("."),
            "magic_format": magic(data),
            "width": int(graded.shape[1]),
            "height": int(graded.shape[0]),
            "aspect": round(graded.shape[1] / graded.shape[0], 3),
            "bytes": len(data),
            "kb": round(len(data) / 1024, 1),
            "accent_hex": "#%02x%02x%02x" % ACCENT,
            "accent_hsv": {"h_deg": round(ACC_H, 1), "s_pct": round(ACC_S * 100, 1),
                           "v_pct": round(ACC_V * 100, 1)},
            "thresholds": {"hue_tol_deg": HUE_TOL, "sat_min": SAT_MIN,
                           "val_min": VAL_MIN},
            "raw": before,
            "graded": after,
            "billed_usd": 0.0,
        }
        report.append(entry)
        print(json.dumps({k: v for k, v in entry.items()
                          if k in ("file", "magic_format", "width", "height",
                                   "kb", "raw", "graded")}, indent=2), flush=True)

    prev = d / "IMAGES.json"
    if prev.exists():
        old = json.loads(prev.read_text(encoding="utf-8"))
        bill = {r["file"]: r.get("billed_usd") for r in old if "file" in r}
        prompts = {r["file"]: r.get("prompt") for r in old if "file" in r}
        roles = {r["file"]: r.get("role") for r in old if "file" in r}
        ids = {r["file"]: r.get("billing", {}).get("request_id") for r in old}
        for e in report:
            src = e["source_requested_ext"]
            key = e["file"].replace(".jpg", ".png")
            e["billed_usd"] = bill.get(key, bill.get(e["file"], 0.0)) or 0.0
            e["prompt"] = prompts.get(key, "")
            e["role"] = roles.get(key, "")
            e["request_id"] = ids.get(key)
            e["requested_size_param"] = "1024x1024 (API ignores it; returned 1024x1024)"
            e.pop("source_requested_ext")
        prev.unlink()
    (d / "IMAGES.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    total = sum(e["billed_usd"] for e in report)
    print(f"\n=== {len(report)} images | total billed ${total:.6f} ===")


if __name__ == "__main__":
    main()