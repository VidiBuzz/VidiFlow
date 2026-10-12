"""Rebuild the Lexi dictionary artifacts from the canonical seed.

`lex/data/seed-unified.json` is the single source of truth for terms. This script derives
the two files every client needs, so the extension, the web app and the Android app can
never drift apart:

  1. lex/extension/data.js            - bundled offline dictionary (window.LEX_DATA)
  2. lex/data/published-terms.json    - flat payload published to
                                        https://cdn.vidi.news/lexi/terms.json (M4 sync,
                                        shared by the extension and Lexi for Android)

Usage:
    C:\\Python314\\python.exe M:\\code\\vidismart\\lex\\pipeline\\build_extension_data.py
    C:\\Python314\\python.exe M:\\code\\vidismart\\lex\\pipeline\\build_extension_data.py --check

`--check` only validates (pre-commit / CI gate): it reports anatomy-shape and content
problems flagged in vidiflow/lex-plan-out.md without writing anything.
"""
import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
LEX = HERE.parent
DATA = LEX / "data"
EXT = LEX / "extension"

SEED = DATA / "seed-unified.json"
DATA_JS = EXT / "data.js"
PUBLISHED = DATA / "published-terms.json"

CDN_FALLBACK = "https://cdn.vidi.news/images/lexi/"
# Anatomy rule (revised 2026-09-16): 3-5 concept parts, not len(acr).
ANATOMY_MIN, ANATOMY_MAX = 3, 5

DATA_JS_TEMPLATE = """/* Lex (Lexi) acronym dictionary - GENERATED FILE, do not edit by hand.
 * Source: lex/data/seed-unified.json
 * Rebuild: C:\\Python314\\python.exe lex/pipeline/build_extension_data.py
 */
(function () {
var LEX_DATA = %s;
var g = typeof globalThis !== "undefined" ? globalThis : window;
g.LEX_DATA = LEX_DATA;
})();
"""


def absolute(cdn_base: str, path: str) -> str:
    if not path:
        return ""
    if "://" in path:
        return path
    base = cdn_base if cdn_base.endswith("/") else cdn_base + "/"
    return base + path.rsplit("/", 1)[-1]


def load_seed() -> dict:
    if not SEED.is_file():
        sys.exit(f"missing seed: {SEED}")
    try:
        return json.loads(SEED.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        sys.exit(f"seed is not valid JSON: {exc}")


def normalise(term: dict, cdn_base: str) -> dict:
    """Keep only the fields the clients render, with CDN-absolute media paths."""
    return {
        "acr": term.get("acr", "").strip(),
        "full": term.get("full", "").strip(),
        "dept": term.get("dept", "").strip(),
        "conceptImg": absolute(cdn_base, term.get("conceptImg", "")),
        "conceptVideo": absolute(cdn_base, term.get("conceptVideo", "")),
        "conceptDesc": term.get("conceptDesc", "").strip(),
        "keywords": [k for k in term.get("keywords", []) if k],
        "oneLiner": term.get("oneLiner", "").strip(),
        "notes": term.get("notes", "").strip(),
        "origin": term.get("origin", "").strip(),
        "anatomy": term.get("anatomy", []) or [],
        "flow": term.get("flow", []) or [],
        "brands": term.get("brands", []) or [],
        "replaces": [r for r in term.get("replaces", []) if r],
        "connectsWith": [c for c in term.get("connectsWith", []) if c],
    }


def validate(terms: list[dict]) -> list[str]:
    problems: list[str] = []
    seen: set[str] = set()
    for term in terms:
        acr = term["acr"]
        if not acr:
            problems.append("term with empty acronym")
            continue
        if acr in seen:
            problems.append(f"{acr}: duplicate acronym")
        seen.add(acr)
        if not term["oneLiner"]:
            problems.append(f"{acr}: missing oneLiner")
        anatomy = term["anatomy"]
        if anatomy and not (ANATOMY_MIN <= len(anatomy) <= ANATOMY_MAX):
            problems.append(f"{acr}: anatomy has {len(anatomy)} parts (expected {ANATOMY_MIN}-{ANATOMY_MAX})")
        if anatomy:
            hints = "".join(str(p.get("letter", ""))[:1] for p in anatomy).upper()
            if not any(ch in acr.upper() for ch in hints):
                problems.append(f"{acr}: anatomy letters {hints!r} do not hint the acronym")
        img = term["conceptImg"]
        if img:
            name = img.rsplit("/", 1)[-1].lower()
            if acr.lower() not in name and not name.startswith(acr.lower()[:4]):
                problems.append(f"{acr}: conceptImg looks wrong ({img})")
    return problems


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="validate only, write nothing")
    args = parser.parse_args()

    seed = load_seed()
    cdn_base = seed.get("cdn_base") or CDN_FALLBACK
    raw_terms = seed.get("terms") or []
    if not raw_terms:
        sys.exit("seed contains no terms")

    terms = [normalise(t, cdn_base) for t in raw_terms]
    terms.sort(key=lambda t: t["acr"].upper())

    problems = validate(terms)
    print(f"seed            : {SEED}")
    print(f"terms           : {len(terms)}")
    print(f"declared total  : {seed.get('total_terms', 'n/a')}")
    print(f"cdn base        : {cdn_base}")

    if problems:
        print(f"\n{len(problems)} validation problem(s):")
        for problem in problems:
            print(f"  - {problem}")
    else:
        print("validation      : OK")

    if args.check:
        sys.exit(1 if problems else 0)

    data_js = DATA_JS_TEMPLATE % json.dumps(
        {t["acr"]: t for t in terms}, indent=2, ensure_ascii=False
    )
    DATA_JS.parent.mkdir(parents=True, exist_ok=True)
    DATA_JS.write_text(data_js, encoding="utf-8")

    published = {
        "version": seed.get("version", "1.0.0"),
        "source": "lex/data/seed-unified.json",
        "cdn_base": cdn_base,
        "count": len(terms),
        "terms": terms,
    }
    PUBLISHED.write_text(json.dumps(published, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"\nwrote {DATA_JS}  ({DATA_JS.stat().st_size:,} bytes)")
    print(f"wrote {PUBLISHED}  ({PUBLISHED.stat().st_size:,} bytes)")
    print("\nNext: publish it to the CDN (used by the extension sync + Lexi for Android):")
    print("  PUT https://cdn.vidi.news/lexi/terms.json  (or upload published-terms.json via the R2 dashboard)")


if __name__ == "__main__":
    main()
