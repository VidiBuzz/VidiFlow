import re, collections, unicodedata
s = open('index.html', encoding='utf-8').read()
bad = collections.Counter()
for ch in s:
    o = ord(ch)
    if o > 0x2000 or (0x2600 <= o <= 0x27BF):
        bad[ch] += 1
for ch, n in bad.most_common(60):
    try: name = unicodedata.name(ch)
    except ValueError: name = '?'
    print(f"U+{ord(ch):04X} {repr(ch)} x{n:3}  {name}")
