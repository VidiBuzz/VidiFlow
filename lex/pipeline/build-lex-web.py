#!/usr/bin/env python3
"""
Build script for Lex web app.
Merges seed-unified.json + terms-research-batch1.json,
generates DEFAULT_TERMS JavaScript object,
and injects it into app/index.html.
"""

import json
import re
from pathlib import Path
from datetime import datetime

ROOT = Path(r"M:\code\VidiFlow\lex")
DATA_DIR = ROOT / "data"
APP_DIR = ROOT / "app"

SEED_FILE = DATA_DIR / "seed-unified.json"
BATCH_FILE = DATA_DIR / "terms-research-batch1.json"
MERGED_FILE = DATA_DIR / "seed-unified.merged.json"
INDEX_FILE = APP_DIR / "index.html"
BACKUP_DIR = APP_DIR / "backups"


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def escape_js_string(s):
    """Escape a string for safe embedding in JavaScript."""
    if s is None:
        return "null"
    if isinstance(s, bool):
        return "true" if s else "false"
    if isinstance(s, (int, float)):
        return str(s)
    if isinstance(s, list):
        return "[" + ", ".join(escape_js_string(x) for x in s) + "]"
    if isinstance(s, dict):
        return "{" + ", ".join(f'"{k}": {escape_js_string(v)}' for k, v in s.items()) + "}"
    # string
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t") + '"'


def term_to_js_obj(term):
    """Convert a term dict to a JS object string."""
    lines = []
    for k, v in term.items():
        if v is None or (isinstance(v, str) and v == ""):
            js_val = "null"
        elif isinstance(v, list):
            if not v:
                js_val = "[]"
            else:
                items = []
                for item in v:
                    if isinstance(item, dict):
                        items.append("{" + ", ".join(f'{kk}: {escape_js_string(vv)}' for kk, vv in item.items()) + "}")
                    elif isinstance(item, str):
                        items.append(escape_js_string(item))
                    else:
                        items.append(escape_js_string(item))
                js_val = "[\n        " + ",\n        ".join(items) + "\n      ]"
        elif isinstance(v, dict):
            if not v:
                js_val = "{}"
            else:
                js_val = "{\n        " + ",\n        ".join(f'{kk}: {escape_js_string(vv)}' for kk, vv in v.items()) + "\n      }"
        else:
            js_val = escape_js_string(v)
        lines.append(f"      {k}: {js_val}")
    return "{\n" + ",\n".join(lines) + "\n    }"


def generate_default_terms_js(terms):
    """Generate the DEFAULT_TERMS JavaScript object."""
    entries = []
    for term in terms:
        acr = term["acr"]
        js_obj = term_to_js_obj(term)
        entries.append(f'    "{acr}": {js_obj}')
    return "var DEFAULT_TERMS = {\n" + ",\n".join(entries) + "\n  };"


def inject_into_index(html_content, new_default_terms_js):
    """Replace the DEFAULT_TERMS block in index.html."""
    start = html_content.find("var DEFAULT_TERMS = {")
    if start < 0:
        raise ValueError("Could not find DEFAULT_TERMS block in index.html")
    
    # Find matching };
    depth = 0
    end = start
    for i, ch in enumerate(html_content[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    
    old_block = html_content[start:end]
    new_html = html_content[:start] + new_default_terms_js + html_content[end:]
    return new_html, old_block


def main():
    print("=== Lex Web Build ===")
    print(f"Root: {ROOT}")
    print()
    
    # 1. Load both sources
    print("Loading seed-unified.json...")
    seed = load_json(SEED_FILE)
    print(f"  terms: {len(seed['terms'])}")
    
    print("Loading terms-research-batch1.json...")
    batch = load_json(BATCH_FILE)
    print(f"  terms: {batch.get('count', len(batch['terms']))}")
    
    # 2. Merge (dedupe by acr, batch wins on conflict)
    print("\nMerging...")
    by_acr = {t["acr"]: t for t in seed["terms"]}
    for t in batch["terms"]:
        by_acr[t["acr"]] = t
    
    merged_terms = list(by_acr.values())
    merged_terms.sort(key=lambda x: x["acr"].lower())
    print(f"  merged: {len(merged_terms)} unique terms")
    
    # 3. Create merged seed-unified
    merged_seed = seed.copy()
    merged_seed["terms"] = merged_terms
    merged_seed["total_terms"] = len(merged_terms)
    merged_seed["version"] = f"2.0.0-merged-{datetime.now().strftime('%Y%m%d')}"
    merged_seed["merged_from"] = [
        str(SEED_FILE.relative_to(ROOT)),
        str(BATCH_FILE.relative_to(ROOT))
    ]
    merged_seed["merged_at"] = datetime.now().isoformat()
    
    save_json(MERGED_FILE, merged_seed)
    print(f"  wrote: {MERGED_FILE}")
    
    # 4. Generate DEFAULT_TERMS JS
    print("\nGenerating DEFAULT_TERMS JavaScript...")
    default_terms_js = generate_default_terms_js(merged_terms)
    print(f"  size: {len(default_terms_js):,} chars")
    
    # 5. Read index.html and inject
    print("\nReading index.html...")
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        html = f.read()
    
    print("Injecting DEFAULT_TERMS...")
    new_html, old_block = inject_into_index(html, default_terms_js)
    
    # 6. Backup and write
    BACKUP_DIR.mkdir(exist_ok=True)
    backup_file = BACKUP_DIR / f"index.html.backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    with open(backup_file, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  backup: {backup_file}")
    
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        f.write(new_html)
    print(f"  wrote: {INDEX_FILE}")
    
    # 7. Verify
    print("\nVerification:")
    new_count = new_html.count('"acr":')
    print(f"  acr occurrences in new HTML: {new_count}")
    print(f"  expected: {len(merged_terms)}")
    
    print("\n✅ Build complete!")
    print(f"   Open: file:///{INDEX_FILE.as_posix()}")


if __name__ == "__main__":
    main()