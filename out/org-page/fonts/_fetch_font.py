import re, os, urllib.request

F = r"M:\code\VidiFlow\out\org-page\fonts"
css = open(os.path.join(F, "kumbh2.css"), "r", encoding="utf-8").read()
blocks = re.findall(r"@font-face\s*\{(.*?)\}", css, re.S)
out = []
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"}
n = 0
for b in blocks:
    w = re.search(r"font-weight:\s*(\d+)", b).group(1)
    u = re.search(r"url\((https://[^)]+woff2)\)", b)
    ur = re.search(r"unicode-range:\s*([^;]+);", b)
    if not u:
        continue
    n += 1
    name = f"kumbh-{n}.woff2"
    path = os.path.join(F, name)
    req = urllib.request.Request(u.group(1), headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r, open(path, "wb") as fh:
        fh.write(r.read())
    urange = ur.group(1).strip() if ur else None
    face = ("@font-face{font-family:'Kumbh Sans';font-style:normal;font-weight:%s;"
            "font-display:swap;src:url('fonts/%s') format('woff2');%s}") % (
            w, name, ("unicode-range:%s;" % urange) if urange else "")
    out.append(face)
    print("saved", name, w, os.path.getsize(path), "bytes")

with open(os.path.join(F, "kumbh-local.css"), "w", encoding="utf-8") as fh:
    fh.write("\n".join(out) + "\n")
print("faces:", len(out))
