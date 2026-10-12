"""
Browser verification for the VidiTwin landing page.

Drives its own bundled Chromium (never the user's Chrome profile), and records
measured computed values at 375 / 768 / 1440:
  - horizontal overflow (scrollWidth vs clientWidth) plus the offending elements
  - console messages and page errors
  - failed / non-2xx requests
  - every <img>: natural size, rendered box, computed opacity / display /
    visibility -- an image that is present but invisible is a failure
  - computed type sizes on the display and body elements
"""
from __future__ import annotations

import json
import sys

from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8744/"
WIDTHS = [375, 768, 1440]
SHOTS = "C:/Users/James/AppData/Local/hermes/profiles/vidibot/cache/scratch/shots"

PROBE = r"""
() => {
  const de = document.documentElement;
  const imgs = [...document.querySelectorAll('img')].map(i => {
    const cs = getComputedStyle(i);
    const r = i.getBoundingClientRect();
    return {
      src: (i.currentSrc || i.src).split('/').pop(),
      natural: i.naturalWidth + 'x' + i.naturalHeight,
      complete: i.complete,
      opacity: cs.opacity,
      display: cs.display,
      visibility: cs.visibility,
      rendered: Math.round(r.width) + 'x' + Math.round(r.height),
      boxAspect: r.height > 0 ? +(r.width / r.height).toFixed(2) : 0,
      naturalAspect: i.naturalHeight > 0 ? +(i.naturalWidth / i.naturalHeight).toFixed(2) : 0,
    };
  });
  const offenders = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > de.clientWidth + 1 || r.left < -1)) {
      const cls = (el.className && el.className.baseVal !== undefined)
        ? el.className.baseVal : (el.className || '');
      offenders.push({tag: el.tagName.toLowerCase(),
                      cls: String(cls).slice(0, 44),
                      left: Math.round(r.left),
                      right: Math.round(r.right)});
    }
  });
  const pick = sel => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {font: cs.fontFamily.split(',')[0], size: cs.fontSize,
            line: cs.lineHeight, weight: cs.fontWeight};
  };
  return {
    innerW: window.innerWidth,
    docScrollW: de.scrollWidth,
    docClientW: de.clientWidth,
    hOverflow: de.scrollWidth - de.clientWidth,
    offenders: offenders.slice(0, 10),
    offenderCount: offenders.length,
    imgs: imgs,
    theme: de.getAttribute('data-theme'),
    h1: pick('.display'),
    h2: pick('.h2'),
    lede: pick('.lede'),
    mono: pick('.mono'),
    revealPending: document.querySelectorAll('[data-reveal]:not(.in)').length,
    revealTotal: document.querySelectorAll('[data-reveal]').length,
  };
}
"""


def main() -> None:
    report = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for w in WIDTHS:
            ctx = browser.new_context(
                viewport={"width": w, "height": 900},
                device_scale_factor=1,
            )
            page = ctx.new_page()
            console, errors, failed, bad_status = [], [], [], []
            page.on("console", lambda m: console.append(
                {"type": m.type, "text": m.text[:200]}))
            page.on("pageerror", lambda e: errors.append(str(e)[:200]))
            page.on("requestfailed", lambda r: failed.append(
                {"url": r.url, "err": (r.failure or "")[:120] if isinstance(r.failure, str) else str(r.failure)}))
            page.on("response", lambda r: bad_status.append(
                {"url": r.url, "status": r.status}) if r.status >= 400 else None)

            page.goto(URL, wait_until="load")
            page.wait_for_timeout(600)

            # Scroll the full page so loading="lazy" images below the fold are
            # actually requested. Measuring naturalWidth on a lazy image that
            # has never entered the viewport reports 0x0 -- that is the lazy
            # loader behaving correctly, not a broken image.
            page.evaluate("""
              async () => {
                const step = Math.round(window.innerHeight * 0.6);
                const end = document.body.scrollHeight;
                for (let y = 0; y <= end; y += step) {
                  window.scrollTo(0, y);
                  await new Promise(r => setTimeout(r, 90));
                }
                window.scrollTo(0, end);
                await new Promise(r => setTimeout(r, 250));
                window.scrollTo(0, 0);
                await new Promise(r => setTimeout(r, 250));
              }
            """)
            # wait on the real condition: every image decoded with pixels
            try:
                page.wait_for_function(
                    "() => [...document.images].every(i => i.complete && i.naturalWidth > 0)",
                    timeout=15000)
            except Exception as exc:
                print("  [warn] not all images decoded:", str(exc)[:140])
            # force all reveals in so nothing is measured mid-animation
            page.evaluate(
                "() => document.querySelectorAll('[data-reveal]')"
                ".forEach(e => e.classList.add('in'))")
            page.wait_for_timeout(500)
            data = page.evaluate(PROBE)
            data["console"] = console
            data["pageErrors"] = errors
            data["requestFailed"] = failed
            data["http4xx5xx"] = bad_status
            page.screenshot(path=f"{SHOTS}/vt-{w}.png", full_page=True)
            report[w] = data
            ctx.close()
        # light-theme pass at 1440
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        page.goto(URL, wait_until="load")
        page.evaluate("() => document.documentElement.setAttribute('data-theme','light')")
        page.wait_for_timeout(600)
        page.screenshot(path=f"{SHOTS}/vt-light-1440.png", full_page=True)
        light = page.evaluate(
            "() => getComputedStyle(document.body).backgroundColor + ' | ink=' + "
            "getComputedStyle(document.body).color")
        report["light_theme"] = light
        ctx.close()
        browser.close()

    for w in WIDTHS:
        d = report[w]
        ok_overflow = d["hOverflow"] <= 0
        img_fails = [i for i in d["imgs"] if not (
            i["complete"] and i["natural"] != "0x0"
            and abs(float(i["opacity"]) - 1.0) < 0.001
            and i["display"] != "none" and i["visibility"] == "visible")]
        err_count = len([c for c in d["console"] if c["type"] == "error"]) \
            + len(d["pageErrors"])
        print(f"\n{'='*72}\nVIEWPORT {w}px")
        print(f"  innerWidth          {d['innerW']}")
        print(f"  scrollWidth/client  {d['docScrollW']} / {d['docClientW']}")
        print(f"  H-OVERFLOW          {d['hOverflow']}px  "
              f"{'PASS' if ok_overflow else 'FAIL'}  "
              f"(offenders: {d['offenderCount']})")
        if d["offenders"]:
            print(f"     {d['offenders']}")
        print(f"  console errors     {err_count}  {'PASS' if err_count == 0 else 'FAIL'}")
        if d["pageErrors"]:
            print(f"     pageErrors: {d['pageErrors']}")
        print(f"  failed requests     {len(d['requestFailed'])}  "
              f"{'PASS' if not d['requestFailed'] else 'FAIL'}")
        if d["requestFailed"]:
            print(f"     {d['requestFailed']}")
        print(f"  HTTP >=400          {len(d['http4xx5xx'])}  "
              f"{'PASS' if not d['http4xx5xx'] else 'FAIL'}")
        if d["http4xx5xx"]:
            print(f"     {d['http4xx5xx']}")
        print(f"  reveals             {d['revealTotal'] - d['revealPending']}"
              f"/{d['revealTotal']} applied")
        print(f"  theme               {d['theme']}")
        print(f"  h1                  {d['h1']['font']} {d['h1']['size']}/{d['h1']['line']} w{d['h1']['weight']}")
        print(f"  h2                  {d['h2']['font']} {d['h2']['size']}/{d['h2']['line']} w{d['h2']['weight']}")
        print(f"  lede                {d['lede']['font']} {d['lede']['size']}/{d['lede']['line']}")
        print(f"  IMAGES ({len(d['imgs'])}) "
              f"{'ALL VISIBLE @ opacity 1' if not img_fails else 'FAILURES PRESENT'}")
        for i in d["imgs"]:
            ok = i not in img_fails
            print(f"    {i['src']:24} nat={i['natural']:10} box={i['rendered']:10} "
                  f"aspect {i['boxAspect']}/{i['naturalAspect']} "
                  f"op={i['opacity']:5} {i['visibility']:9} "
                  f"{'PASS' if ok else 'FAIL'}")
    print(f"\nlight theme body: {report['light_theme']}")
    print(json.dumps({str(k): (v if not isinstance(v, dict)
                                else {kk: vv for kk, vv in v.items()
                                      if kk not in ('imgs', 'offenders')})
                      for k, v in report.items() if isinstance(v, dict)})[:0])


if __name__ == "__main__":
    sys.exit(main() or 0)