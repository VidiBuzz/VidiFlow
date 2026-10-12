#!/usr/bin/env python3
"""Render LOAD-INTO-KUMIHO.md to a standalone styled HTML page (local reading copy)."""
from pathlib import Path
import markdown

HERE = Path(__file__).resolve().parent
src = (HERE / "LOAD-INTO-KUMIHO.md").read_text(encoding="utf-8")
body = markdown.markdown(src, extensions=["tables", "fenced_code", "toc", "sane_lists"])

CSS = """
:root { --bg:#0b0f14; --panel:#121821; --ink:#e8eef6; --dim:#9fb0c3;
        --line:#22303f; --accent:#6cc2ff; --warn:#ffcc66; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--ink);
       font:16px/1.65 "Segoe UI",system-ui,-apple-system,sans-serif;
       text-wrap:pretty; overflow-wrap:anywhere; }
main { max-width:1040px; margin:0 auto; padding:48px 28px 96px; }
h1,h2,h3 { line-height:1.25; text-wrap:balance; letter-spacing:-0.01em; }
h1 { font-size:2rem; margin:0 0 .4em; }
h2 { font-size:1.35rem; margin:2.2em 0 .6em; padding-bottom:.3em; border-bottom:1px solid var(--line); }
h3 { font-size:1.08rem; margin:1.6em 0 .5em; color:var(--accent); }
p, ul, ol { margin:.6em 0; }
a { color:var(--accent); text-decoration:none; border-bottom:1px solid rgba(108,194,255,.35); }
a:hover { border-bottom-color:var(--accent); }
code { background:#0f1620; border:1px solid var(--line); border-radius:4px;
       padding:.1em .35em; font:13.5px/1.5 "Cascadia Mono",Consolas,monospace;
       overflow-wrap:anywhere; }
pre { background:var(--panel); border:1px solid var(--line); border-radius:10px;
      padding:14px 16px; overflow-x:auto; }
pre code { background:none; border:0; padding:0; }
table { display:block; overflow-x:auto; width:100%; border-collapse:collapse; margin:1em 0;
        font-size:14.5px; background:var(--panel); border:1px solid var(--line); border-radius:10px; }
th,td { text-align:left; padding:9px 12px; border-bottom:1px solid var(--line);
        vertical-align:top; overflow-wrap:anywhere; }
th { background:#16202c; color:var(--ink); font-weight:600; }
tr:last-child td { border-bottom:0; }
blockquote { margin:1em 0; padding:.4em 1em; border-left:3px solid var(--accent);
             background:#101a24; color:var(--dim); }
hr { border:0; border-top:1px solid var(--line); margin:2.4em 0; }
strong { color:#fff; }
ul { padding-left:1.3em; }
"""

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Loading the constellation into the real Kumiho</title>
<style>{CSS}</style></head>
<body><main>{body}</main></body></html>
"""
out = HERE / "LOAD-INTO-KUMIHO.html"
out.write_text(html, encoding="utf-8")
print(f"wrote {out} ({out.stat().st_size} bytes)")
