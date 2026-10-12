"""Rebuild the unified 15-term LEX seed and derive the Track A prompt pack.

Sources (local, no SSH needed):
  - M:/code/vidismart/lexi-extension/data.js   (13 terms, window.LEX_DATA)
  - M:/code/vidismart/data/lexi_master_terms.json (Dragonfly, Valkey, SaaS-richer)

Merge rule (per lex-plan-out.md addendum): SaaS prefers the master version;
Dragonfly + Valkey come from master only. Total unique = 15.

Outputs (written next to this script):
  - seed-unified.json  : rebuilt unified seed (cdn_base https://cdn.vidi.news/images/lexi/, bucket vidismart)
  - prompt-pack.json   : Track A prompts (image + video) per term, style suffix applied

Run: C:\\Python314\\python.exe lexi-pipeline/build_prompt_pack.py
Requires: node on PATH (to convert data.js -> JSON).
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent  # M:/code/vidismart
HERE = Path(__file__).resolve().parent               # lex/pipeline
DATA = HERE.parent / "data"                          # lex/data
DATA_JS = ROOT / "lex" / "extension" / "data.js"
MASTER = DATA / "lexi_master_terms.json"

STYLE_SUFFIX = (
    ", holographic explainer art, deep-navy background #0b0f1e, "
    "cyan/magenta glow, no text, 16:9, 1920x1080"
)
CDN_BASE = "https://cdn.vidi.news/"
R2_BUCKET = "vidismart"
VIDEO_TOP_TERMS = ["CRM", "RAG", "LLM", "SaaS"]

# Master-only terms have no conceptDesc (they use smartStack narrative).
# Synthesized visual descriptions in the same holographic-explainer register.
SYNTHESIZED_CONCEPT_DESC = {
    "Dragonfly": (
        "A glowing holographic dragonfly whose wings are spinning multi-core "
        "processor threads, routing millions of luminous data packets between "
        "memory cores at microsecond speed"
    ),
    "Valkey": (
        "A luminous open-source vault at the center of a community-governed "
        "network, streaming glowing key-value data crystals through an "
        "emerald-green in-memory lattice at sub-millisecond speed"
    ),
}


def load_data_js() -> dict:
    js = (
        f"require({json.dumps(str(DATA_JS).replace(chr(92), '/'))});"
        "console.log(JSON.stringify(globalThis.LEX_DATA));"
    )
    out = subprocess.run(
        ["node", "-e", js],
        capture_output=True,
        text=True,
        check=True,
        encoding="utf-8",
    ).stdout
    return json.loads(out)


def normalize(term: dict) -> dict:
    acr = term["acr"]
    desc = term.get("conceptDesc", "").strip()
    if not desc:
        desc = SYNTHESIZED_CONCEPT_DESC.get(acr, "")
    return {
        "acr": acr,
        "full": term.get("full", ""),
        "dept": term.get("dept", ""),
        "category": term.get("category", ""),
        "logoSvg": term.get("logoSvg", ""),
        "conceptDesc": desc,
        "conceptImg": f"images/lexi/{acr}.jpg",
        "conceptVideo": f"videos/lexi/{acr}.mp4",
        "keywords": term.get("keywords", []),
        "oneLiner": term.get("oneLiner", ""),
        "notes": term.get("notes", ""),
        "origin": term.get("origin", ""),
        "smartStack": term.get("smartStack"),
        "anatomy": term.get("anatomy", []),
        "flow": term.get("flow", []),
        "brands": term.get("brands", []),
        "replaces": term.get("replaces", []),
        "connectsWith": term.get("connectsWith", []),
    }


def apply_seed_fixes(terms: list[dict]) -> list[dict]:
    """Preserve box-side seed fixes (lex-plan-out.md §9) across rebuilds.

    AAFES anatomy must be 5 items with Air/Force split (A-A-F-E-S);
    data.js ships the pre-fix 4-item version with a merged "Air Force".
    """
    for t in terms:
        if t["acr"] != "AAFES":
            continue
        fixed = []
        for item in t.get("anatomy") or []:
            if item.get("word") == "Air Force":
                fixed.append({**item, "word": "Air",
                              "desc": "US Air Force active duty, veterans, and their families."})
                fixed.append({"letter": "F", "word": "Force",
                              "role": item.get("role", "Service Branch"),
                              "desc": "Air Force & Space Force installations worldwide.",
                              "icon": "🚀"})
            else:
                fixed.append(item)
        t["anatomy"] = fixed
    return terms


def merge() -> list[dict]:
    js_terms = load_data_js()
    master = json.loads(MASTER.read_text(encoding="utf-8"))
    master_by_acr = {t["acr"]: t for t in master["terms"]}

    merged: dict[str, dict] = {}
    for acr, term in js_terms.items():
        # SaaS: master version is richer (smartStack/category/logoSvg/conceptVideo)
        src = master_by_acr.get(acr, term) if acr == "SaaS" else term
        merged[acr] = normalize(src)
    for acr in ("Dragonfly", "Valkey"):
        if acr in master_by_acr:
            merged[acr] = normalize(master_by_acr[acr])

    # conceptDesc fallback: data.js SaaS lacks conceptDesc in master? keep whichever exists
    if not merged.get("SaaS", {}).get("conceptDesc") and "SaaS" in js_terms:
        merged["SaaS"]["conceptDesc"] = js_terms["SaaS"].get("conceptDesc", "")

    order = list(js_terms.keys()) + ["Dragonfly", "Valkey"]
    return apply_seed_fixes([merged[a] for a in order if a in merged])


def build_prompts(terms: list[dict]) -> list[dict]:
    pack = []
    for t in terms:
        acr = t["acr"]
        desc = t["conceptDesc"].strip().rstrip(".")
        flow = t.get("flow") or []
        shots = [
            {
                "beat": i + 1,
                "title": f.get("title", ""),
                "desc": f.get("desc", ""),
                "active": bool(f.get("active")),
            }
            for i, f in enumerate(flow[:4])
        ]
        shot_lines = "; ".join(
            f"shot {s['beat']}: {s['title']} - {s['desc'].rstrip('.')}" for s in shots
        )
        pack.append(
            {
                "acr": acr,
                "full": t["full"],
                "priority": "top" if acr in VIDEO_TOP_TERMS else "standard",
                "image": {
                    "prompt": desc + STYLE_SUFFIX,
                    "r2_key": f"images/lexi/{acr}.jpg",
                    "cdn_url": CDN_BASE + f"images/lexi/{acr}.jpg",
                    "aspect": "16:9",
                    "resolution": "1920x1080",
                },
                "video": {
                    "mode": "image-to-video",
                    "source_image_r2_key": f"images/lexi/{acr}.jpg",
                    "prompt": (
                        f"Animated explainer for {acr} ({t['full']}): {desc}. "
                        f"Follow beats - {shot_lines}. "
                        "Slow cinematic camera push-in, subtle holographic shimmer, "
                        "glowing particles, no text overlays, 16:9, 1080p."
                    ),
                    "r2_key": f"videos/lexi/{acr}.mp4",
                    "cdn_url": CDN_BASE + f"videos/lexi/{acr}.mp4",
                    "max_seconds": 30,
                    "codec": "H.265",
                    "max_mb": 15,
                },
            }
        )
    return pack


def main() -> int:
    terms = merge()
    if len(terms) != 15:
        print(f"WARNING: expected 15 terms, got {len(terms)}", file=sys.stderr)

    seed = {
        "version": "2.0.0-rebuilt",
        "rebuiltFrom": [
            "lex/extension/data.js",
            "lex/data/lexi_master_terms.json",
        ],
        "cdn_base": CDN_BASE + "images/lexi/",
        "r2_bucket": R2_BUCKET,
        "directus_collection": "lexi_terms",
        "total_terms": len(terms),
        "terms": terms,
    }
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / "seed-unified.json").write_text(
        json.dumps(seed, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    pack = {
        "generated_for": "Track A - Grok Imagine 1.5 (cloud) / manual drop",
        "style_suffix": STYLE_SUFFIX,
        "drop_folder": "images/lexi-new/ (repo root; WSL: /mnt/m/code/vidismart/images/lexi-new/)",
        "top_terms_video_first": VIDEO_TOP_TERMS,
        "prompts": build_prompts(terms),
    }
    (DATA / "prompt-pack.json").write_text(
        json.dumps(pack, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print(f"terms: {len(terms)}")
    for t in terms:
        flag = " [video-top]" if t["acr"] in VIDEO_TOP_TERMS else ""
        print(f"  {t['acr']:<10} {t['full'][:50]}{flag}")
    print("wrote:", DATA / "seed-unified.json")
    print("wrote:", DATA / "prompt-pack.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
