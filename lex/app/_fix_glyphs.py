import re

PALETTE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-2px"><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none"/></svg>'
LETTERS = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-2px"><path d="M5 8V6h14v2"/><path d="M12 6v12M9 18h6"/></svg>'
BOLT = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-2px"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>'
GLOBE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-2px"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/></svg>'
SPEAKER = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-2px"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
DOC = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-2px"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/></svg>'

p = 'index.html'
s = open(p, encoding='utf-8').read()
b_fe = s.count('\ufe0f')

# Lone VS16 icon values in JS data -> JS-side ICON reference (ICON is in scope there)
n_icon = s.count('icon: "\ufe0f"')
s = s.replace('icon: "\ufe0f"', 'icon: ICON.doc')

# Bare lone VS16 in static markup (the layer-4 header span) -> literal SVG
n_span = s.count('>\ufe0f<')
s = s.replace('>\ufe0f<', '>' + DOC + '<')

# Stage nav pills (static HTML) -> literal SVG
s = s.replace('>\U0001f3a8 3D Blueprint<', '>' + PALETTE + ' 3D Blueprint<')
s = s.replace('>\U0001f524 Word Anatomy<', '>' + LETTERS + ' Word Anatomy<')
s = s.replace('>\u26a1 System Flowchart<', '>' + BOLT + ' System Flowchart<')
s = s.replace('>\U0001f310 Brands &amp; Ecosystem<', '>' + GLOBE + ' Brands &amp; Ecosystem<')

# Speaker emoji in generated co-host buttons (JS string concat) -> literal SVG
n_spk = s.count('\U0001f50a Listen')
s = s.replace('\U0001f50a Listen', SPEAKER + ' Listen')

open(p, 'w', encoding='utf-8').write(s)
print('VS16 before/after:', b_fe, s.count('\ufe0f'))
print('icon: ->ICON.doc:', n_icon, ' bare-span:', n_span, ' speaker:', n_spk)
print('remaining emoji/symbol scan:')
import collections, unicodedata
bad = collections.Counter()
for ch in s:
    o = ord(ch)
    if o > 0x2000 or (0x2600 <= o <= 0x27BF):
        bad[ch] += 1
for ch, n in bad.most_common(20):
    try: nm = unicodedata.name(ch)
    except ValueError: nm = '?'
    print(f'  U+{ord(ch):04X} {repr(ch)} x{n}  {nm}')
