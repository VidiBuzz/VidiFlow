import re, os, struct
from html.parser import HTMLParser

PATH = r"M:\code\VidiFlow\out\medical-ai-landscape-report.html"
BASE = r"M:\code\VidiFlow\out"
html = open(PATH, encoding="utf-8").read()

VOID = {"meta", "link", "img", "br", "hr", "input", "source"}

class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.st = []
        self.err = []
    def handle_starttag(self, t, a):
        if t not in VOID:
            self.st.append(t)
    def handle_endtag(self, t):
        if t in VOID:
            return
        if self.st and self.st[-1] == t:
            self.st.pop()
        else:
            self.err.append((t, self.getpos(), self.st[-4:]))

p = P()
p.feed(html)
print("unclosed tags:", p.st)
print("mismatched tags:", p.err)

refs = [r for r in re.findall(r'src="([^"]+)"', html) if not r.startswith("http")]
missing = [r for r in refs if not os.path.exists(os.path.join(BASE, r))]
print("img refs:", len(refs), "| missing:", missing)
for r in refs:
    d = open(os.path.join(BASE, r), "rb").read(24)
    w, h = struct.unpack(">II", d[16:24])
    print("  ", r, "%dx%d" % (w, h))

checks = ["AntAngelMed", "MedGemma", "Med42", "BailingMoeV2ForCausalLM", "GRPO",
          "13,824", "vista3d", "MedSAM2", "CT-RATE", "antangelmed.tbox.cn",
          "Apache-2.0", "Made with Cline", "Compiled by Cline", "HealthBench",
          "NV-Generate-MR", "RadViLLA", "CT-CHAT", "Qwen3-VL-Embedding-2B"]
bad = [c for c in checks if c not in html]
print("content checks:", "ALL PRESENT" if not bad else "MISSING: %s" % bad)
print("openrouter refs:", len(re.findall(r"(?i)openrouter", html)))
