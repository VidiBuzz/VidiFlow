"""Generate a scene-spec skeleton for one LEX term (manual export path, step 4).

Workflow position: DRAFT on LTX Desktop (4090) -> run this to lock a scene spec
-> set approval.status=approved in Directus (APPROVE gate) -> orchestrator
delegates to the H3 worker on Miami (DELEGATE).

Pre-fills from seed-unified.json: prompt (conceptDesc), beats (flow[4]),
keyframe (concept image R2 key), output keys/URLs. The operator edits
camera/motion/h3_structured fields, then this script validates against
scene-spec.schema.json before writing.

Usage:
  C:\\Python314\\python.exe lexi-pipeline/make_scene_spec.py CRM \
      [--draft-path "C:/Users/James/Videos/ltx-desktop/CRM-draft-07.mp4"] \
      [--duration 12] [--seed 20260918] [--quality premium] \
      [--checkpoint FL2VA] [--out lexi-pipeline/scene-specs/CRM.json]
"""
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
SEED = HERE.parent / "data" / "seed-unified.json"
SCHEMA = HERE.parent / "data" / "scene-spec.schema.json"
OUT_DIR = HERE.parent / "data" / "scene-specs"

H3_STYLE = "holographic explainer art, deep-navy void #0b0f1e, cyan/magenta glow, no text, 16:9"


def find_term(acr: str) -> dict:
    seed = json.loads(SEED.read_text(encoding="utf-8"))
    for t in seed["terms"]:
        if t["acr"].lower() == acr.lower():
            return t
    known = ", ".join(t["acr"] for t in seed["terms"])
    sys.exit(f"error: term '{acr}' not in seed-unified.json. Known: {known}")


def beat_time_ranges(n: int, duration: float) -> list[list[float]]:
    step = duration / n
    return [[round(i * step, 2), round((i + 1) * step, 2)] for i in range(n)]


def build_spec(term: dict, args: argparse.Namespace) -> dict:
    acr = term["acr"]
    desc = term["conceptDesc"].strip().rstrip(".")
    flow = (term.get("flow") or [])[:4]
    duration = args.duration
    ranges = beat_time_ranges(len(flow), duration)

    beats = []
    for i, f in enumerate(flow):
        beats.append(
            {
                "beat": i + 1,
                "title": f.get("title", ""),
                "desc": f.get("desc", ""),
                "camera": "TODO: camera move for this beat",
                "motion": "TODO: subject/scene motion for this beat",
                "time_range_s": ranges[i],
                **({"active": True} if f.get("active") else {}),
            }
        )

    return {
        "spec_version": "1.0",
        "term": {"acr": acr, "full": term.get("full", "")},
        "draft": {
            "engine": "ltx-desktop",
            "host": "windows-4090",
            "operator": args.operator,
            **({"preview_local_path": args.draft_path} if args.draft_path else {}),
            "drafted_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "iterations": args.iterations,
        },
        "prompt": {
            "natural": f"{desc}. TODO: add direction (camera arc, ending beat).",
            "h3_structured": {
                "subject": f"TODO: holographic metaphor for {acr} - {desc}",
                "scene": "deep-navy cyberspace void (#0b0f1e) with faint grid horizon",
                "motion": "TODO: what moves, in what order, synced to beats",
                "camera": "TODO: overall camera arc (e.g. slow push-in wide to medium)",
                "lighting": "cyan and magenta rim glow, volumetric light shafts",
                "style": H3_STYLE,
                "audio": "TODO: ambient bed + per-beat accents (H3 native stereo)",
            },
            "h3_text": "TODO: flatten h3_structured into the final H3 prompt text.",
            "negative": "text, captions, watermark, logos, distorted faces, flicker, low contrast",
        },
        "keyframes": [
            {
                "role": "first",
                "source": f"images/lexi/{acr}.jpg",
                "note": "Track A concept image as first frame (FL2VA I2V).",
            }
        ],
        "h3_checkpoint": args.checkpoint,
        "duration_s": duration,
        "fps": 24,
        "beats": beats,
        "resolution": {
            "native": "768p",
            "target": "1080p" if args.quality == "premium" else "720p",
            "upscale": {"method": "esrgan" if args.quality == "premium" else "none"},
        },
        "seed": args.seed,
        "audio": {"native_stereo": True},
        "encode": {"codec": "h265", "container": "mp4", "max_mb": 15},
        "output": {
            "r2_bucket": "vidismart",
            "r2_key": f"videos/lexi/{acr}.mp4",
            "cdn_url": f"https://cdn.vidi.news/videos/lexi/{acr}.mp4",
        },
        "quality": args.quality,
        "approval": {"status": "pending"},
        "render": {"engine": args.render_engine, "queue": "lex:h3:render", "attempts": 0, "last_error": None},
        "review": {},
    }


def validate(spec: dict) -> None:
    try:
        import jsonschema
    except ImportError:
        print("warning: jsonschema not installed; skipping validation", file=sys.stderr)
        return
    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    errors = list(jsonschema.Draft202012Validator(schema).iter_errors(spec))
    if errors:
        for e in errors:
            print(f"schema error at {e.json_path}: {e.message[:160]}", file=sys.stderr)
        sys.exit(1)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("acr", help="Term acronym, e.g. CRM")
    ap.add_argument("--draft-path", help="Local LTX Desktop draft preview path")
    ap.add_argument("--duration", type=float, default=12.0, help="Clip seconds (max 15)")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--quality", choices=["draft", "standard", "premium"], default="premium")
    ap.add_argument("--checkpoint", choices=["FL2VA", "Ref2VA"], default="FL2VA")
    ap.add_argument("--operator", default="james")
    ap.add_argument("--iterations", type=int, default=0)
    ap.add_argument(
        "--render-engine",
        choices=["h3-local-miami", "h3-local-4090-fallback"],
        default="h3-local-miami",
    )
    ap.add_argument("--out", default=None, help="Output path (default scene-specs/<ACR>.json)")
    args = ap.parse_args()

    if args.duration <= 0 or args.duration > 15:
        sys.exit("error: --duration must be in (0, 15] (H3 open-weights ceiling)")

    term = find_term(args.acr)
    spec = build_spec(term, args)
    validate(spec)

    out = Path(args.out) if args.out else OUT_DIR / f"{term['acr']}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(spec, indent=2, ensure_ascii=False), encoding="utf-8")

    todos = json.dumps(spec).count("TODO")
    print(f"wrote {out} ({todos} TODO fields to edit before APPROVE)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
