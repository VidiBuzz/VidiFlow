
import json, sys
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8833/landing.html"

def ctr_ratio(js):
    return js

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    out = {"console": [], "pageerrors": [], "widths": {}}
    ctx = b.new_context(viewport={"width":1440,"height":900}, device_scale_factor=1)
    pg = ctx.new_page()
    pg.on("console", lambda m: out["console"].append(f"{m.type}: {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: out["pageerrors"].append(str(e)))
    pg.goto(URL, wait_until="load")
    pg.wait_for_timeout(700)

    for w in (375, 768, 1440):
        pg.set_viewport_size({"width": w, "height": 900})
        pg.wait_for_timeout(400)
        d = pg.evaluate("""() => {
          const de=document.documentElement;
          const over=[...document.querySelectorAll('body *')].filter(el=>{
            const r=el.getBoundingClientRect();
            return r.width>0 && (r.right > de.clientWidth+1 || r.left < -1);
          }).slice(0,8).map(el=>el.tagName+'.'+(el.className&&el.className.toString?el.className.toString().split(' ')[0]:'')+' r='+Math.round(el.getBoundingClientRect().right));
          return {
            scrollW: de.scrollWidth, clientW: de.clientWidth,
            hasHScroll: de.scrollWidth > de.clientWidth,
            offenders: over
          };
        }""")
        d["cta"] = pg.evaluate("""() => {
          const el=document.querySelector('.masthead .btn');
          if(!el) return null;
          const r=el.getBoundingClientRect();
          const cs=getComputedStyle(el);
          const range=document.createRange(); range.selectNodeContents(el);
          return {text: el.innerText.replace(/\\s+/g,' ').trim(), h: +r.height.toFixed(1), w: +r.width.toFixed(1),
                  lineCount: range.getClientRects().length, padding: cs.padding, fontSize: cs.fontSize};
        }""")
        d["cardMeta"] = pg.evaluate("""() => {
          const el=document.querySelector('.card__meta');
          if(!el) return null; const cs=getComputedStyle(el);
          return {fontSize: cs.fontSize, color: cs.color};
        }""")
        d["measuredType"] = pg.evaluate("""() => {
          const g=(s)=>{const e=document.querySelector(s);return e?getComputedStyle(e).fontSize:null};
          return {h1:g('.hero h1'), sectionTitle:g('.section__title'), ctaH2:g('.cta h2'), heroActions:g('.hero__actions .btn--solid'),
                  mastheadCTA:g('.masthead .btn'), mastheadCtaHref:(document.querySelector('.masthead .btn')||{}).getAttribute?document.querySelector('.masthead .btn').getAttribute('href'):null,
                  heroSolidHref:(document.querySelector('.hero__actions .btn--solid')||{getAttribute:()=>null}).getAttribute('href')};
        }""")
        d["solidCTAs"] = pg.evaluate("""() => [...document.querySelectorAll('.btn--solid')].map(b=>b.closest('section,header')?.id||b.closest('section,header')?.className+' -> '+b.innerText.replace(/\\s+/g,' ').trim()+' | href='+(b.getAttribute('href')||b.tagName))""")
        d["rosterTagColor"] = pg.evaluate("""() => {const e=document.querySelector('.roster__tag');return e?getComputedStyle(e).color:null}""")
        d["principleNumColor"] = pg.evaluate("""() => {const e=document.querySelector('.principle__num');return e?getComputedStyle(e).color:null}""")
        d["kickerInkColor"] = pg.evaluate("""() => {const e=document.querySelector('.kicker--ink');return e?getComputedStyle(e).color:null}""")
        d["kickInkBg"] = pg.evaluate("""() => {const e=document.querySelector('.kicker--ink');let n=e;while(n&&n!==document.body){const c=getComputedStyle(n).backgroundColor;if(c&&!/rgba\\(0, 0, 0, 0\\)|transparent/.test(c))return c;n=n.parentElement}return 'none'}""")
        out["widths"][str(w)] = d

    # computed px of the 3 contrast targets with actual effective bg
    out["contrast_targets"] = pg.evaluate("""() => {
      const effBg = (el) => { let n=el; while(n && n!==document.documentElement){ const c=getComputedStyle(n).backgroundColor; if(c && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(c)) return c; n=n.parentElement;} return 'rgb(255,255,255)'; };
      const pick=(s)=>{const e=document.querySelector(s); return e?{color:getComputedStyle(e).color,bg:effBg(e),fontSize:getComputedStyle(e).fontSize}:null};
      return {kickerInk:pick('.kicker--ink'), rosterTag:pick('.roster__tag'), principleNum:pick('.principle__num'),
              kickerDark:pick('.section--dark .kicker')};
    }""")
    b.close()
print(json.dumps(out, indent=1))
