"""
Round 4 - Complete hardware image set for SovServer configurator.
  • Re-downloads all low-quality images (< 60KB)
  • Adds PSU images (4 tiers) + case fans
  • Uses Playwright domcontentloaded + 2500ms, ad-blocking, Newegg CDN priority
"""

import asyncio
import urllib.request
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path("M:/code/vidismart/hardware")
OUT.mkdir(parents=True, exist_ok=True)

# (filename, force_if_smaller_than_kb, url)
TARGETS = [

    # ── MISSING: PSU images ──────────────────────────────────────────────────
    ("psu-silverstone-1000w.jpg", 0,
     "https://www.newegg.com/silverstone-1000w-80-plus-platinum/p/N82E16817256232"),

    ("psu-corsair-ax1200i.jpg", 0,
     "https://www.newegg.com/corsair-ax1200i/p/N82E16817139230"),

    ("psu-corsair-ax1600i.jpg", 0,
     "https://www.newegg.com/corsair-ax1600i/p/N82E16817139233"),

    ("psu-silverstone-2050w.jpg", 0,
     "https://www.newegg.com/silverstone-hela-2050w/p/N82E16817256264"),

    ("psu-dual-1000w.jpg", 0,
     "https://www.newegg.com/silverstone-1000w-80-plus-platinum/p/N82E16817256232"),

    # ── MISSING: Case fans ───────────────────────────────────────────────────
    ("fans-noctua-nfa14.jpg", 0,
     "https://www.newegg.com/noctua-nf-a14-industrialppc-3000-pwm/p/N82E16835608130"),

    # ── LOW QUALITY: Cases (< 30KB — thumbnail sized) ────────────────────────
    ("case-enthoo-pro2.jpg", 60,
     "https://www.newegg.com/phanteks-full-tower-enthoo-pro-2-server-edition-steel-chassis-computer-case-black-ph-es620ptg-bk02/p/N82E16811854127"),

    ("case-o11d-xl.jpg", 60,
     "https://www.newegg.com/lian-li-atx-mid-tower-aluminum-steel-tempered-glass-cases-black-o11dexl-x/p/2AM-000Z-000B4"),

    ("case-7000d.jpg", 60,
     "https://www.newegg.com/corsair-7000d-airflow/p/N82E16811139170"),

    ("case-rm44.jpg", 60,
     "https://www.newegg.com/silverstone-rm44/p/2AM-006F-001D2"),

    # ── LOW QUALITY: GPU Arc Pro B70 (13KB — tiny) ───────────────────────────
    ("gpu-arc-b70.jpg", 40,
     "https://www.newegg.com/intel-arc-pro-b70-32gb-graphics-card/p/N82E16814883008"),

    # ── LOW QUALITY: RAM (13KB — tiny) ───────────────────────────────────────
    ("ram-ddr5-rdimm.jpg", 40,
     "https://www.newegg.com/kingston-64gb/p/N82E16820242881"),

    # ── LOW QUALITY: CPUs (18KB each — same box art) ─────────────────────────
    ("cpu-7845wx.jpg", 40,
     "https://www.newegg.com/amd-ryzen-threadripper-7000-series-ryzen-threadripper-pro-7965wx-storm-peak-socket-str5-desktop-cpu-processor/p/N82E16819113805"),

    ("cpu-7975wx.jpg", 40,
     "https://www.newegg.com/amd-ryzen-threadripper-7000-series-ryzen-threadripper-pro-7985wx-storm-peak-socket-str5-desktop-cpu-processor/p/N82E16819113809"),

    ("cpu-7995wx.jpg", 40,
     "https://www.newegg.com/amd-ryzen-threadripper-7000-series-ryzen-threadripper-pro-7995wx-storm-peak-socket-str5-desktop-cpu-processor/p/N82E16819113810"),

    # ── LOW QUALITY: Cooling ─────────────────────────────────────────────────
    ("cooling-noctua-u14s.jpg", 40,
     "https://www.newegg.com/noctua-nh-u14s-tr5-sp6/p/13C-0005-00336"),

    ("cooling-custom-loop.jpg", 60,
     "https://www.newegg.com/ekwb-liquid-cooling-system/p/37B-000B-003M7"),

    # ── LOW QUALITY: Storage ─────────────────────────────────────────────────
    ("storage-micron-9400.jpg", 50,
     "https://www.newegg.com/p/pl?d=micron+9400+u.3"),
]

# Fallback URLs when primary fails
FALLBACKS = {
    "psu-silverstone-1000w.jpg": "https://www.newegg.com/silverstone-sstsr750/p/N82E16817256215",
    "psu-corsair-ax1200i.jpg":   "https://www.corsair.com/us/en/p/psu/cp-9020261-na/ax1200i-digital-atx-power-supply-1200-watt-80-plus-platinum-fully-modular-psu-cp-9020261-na",
    "psu-corsair-ax1600i.jpg":   "https://www.corsair.com/us/en/p/psu/cp-9020087-na/ax1600i-digital-atx-power-supply-1600-watt-titanium-fully-modular-psu-cp-9020087-na",
    "psu-silverstone-2050w.jpg": "https://www.silverstonetek.com/en/product/info/power-supplies/SST-HA2050R-PM/",
    "psu-dual-1000w.jpg":        None,
    "fans-noctua-nfa14.jpg":     "https://noctua.at/en/nf-a14-industrialppc-3000-pwm",
    "case-7000d.jpg":            "https://www.corsair.com/us/en/p/pc-cases/cc-9011218-ww/7000d-airflow-full-tower-atx-pc-case-black-cc-9011218-ww",
    "case-rm44.jpg":             "https://www.silverstonetek.com/en/product/info/server-rack/RM44/",
    "case-o11d-xl.jpg":          "https://lian-li.com/product/o11d-evo-xl/",
    "case-enthoo-pro2.jpg":      "https://www.phanteks.com/Enthoo-Pro2-Server.html",
    "cooling-noctua-u14s.jpg":   "https://noctua.at/en/nh-u14s-tr5-sp5",
    "storage-micron-9400.jpg":   "https://www.bhphotovideo.com/c/search?q=micron+9400+ssd+u.3&sts=ma",
}


def download_bytes(url: str) -> bytes | None:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
        "Referer": "https://www.newegg.com/",
        "Accept": "image/avif,image/webp,image/jpeg,image/png,*/*",
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = resp.read()
        return data if len(data) > 8000 else None
    except Exception as e:
        print(f"        dl err: {e}")
        return None


async def get_image_url(page, url: str) -> str | None:
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=35000)
        await page.wait_for_timeout(2500)
    except Exception as e:
        print(f"        goto err: {e}")
        return None

    SKIP = ["logo", "favicon", "icon", "facebook", "twitter", "og-image.png",
            "placeholder", "sprite", "badge", "banner", "ad-", "loading", "blank",
            "newegg.com/assets", "corsair.com/content/brand"]

    # 1. og:image / twitter:image
    for sel, attr in [
        ('meta[property="og:image"]',        "content"),
        ('meta[name="twitter:image"]',        "content"),
        ('meta[property="og:image:secure_url"]', "content"),
    ]:
        try:
            val = await page.locator(sel).first.get_attribute(attr, timeout=3000)
            if val and val.startswith("http") and not any(s in val.lower() for s in SKIP):
                return val
        except Exception:
            pass

    # 2. Newegg product CDN
    try:
        img = await page.locator("img[src*='neweggimages.com']").first.get_attribute("src", timeout=3000)
        if img and img.startswith("http"):
            return img
    except Exception:
        pass

    # 3. Product image selectors (Newegg)
    for sel in [
        ".product-main-image img",
        "#A2ImgCollection img",
        ".mainSlide img",
        "[class*='ProductGallery'] img",
        ".swiper-slide-active img",
        ".product-image img",
        "[class*='gallery'] img",
    ]:
        try:
            src = await page.locator(sel).first.get_attribute("src", timeout=2000)
            if src and src.startswith("http") and not any(s in src.lower() for s in SKIP):
                return src
        except Exception:
            pass

    # 4. Largest visible image fallback
    imgs = await page.query_selector_all("img")
    best_src, best_size = None, 0
    for img in imgs[:60]:
        try:
            box = await img.bounding_box()
            if box and box["width"] > 180 and box["height"] > 180:
                area = box["width"] * box["height"]
                if area > best_size:
                    src = await img.get_attribute("src") or ""
                    if src.startswith("http") and not any(s in src.lower() for s in SKIP):
                        best_size = area
                        best_src = src
        except Exception:
            continue
    return best_src


async def main():
    to_run = []
    for filename, min_kb, url in TARGETS:
        dest = OUT / filename
        if dest.exists() and dest.stat().st_size > min_kb * 1024:
            print(f"  SKIP  {filename} ({dest.stat().st_size // 1024}KB >= {min_kb}KB threshold)")
            continue
        to_run.append((filename, url, dest))

    if not to_run:
        print("All images already meet quality threshold.")
    else:
        print(f"\nRound 4 — fetching {len(to_run)} images\n")

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
        )
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
            }
        )
        page = await context.new_page()
        await page.route("**/{ads,analytics,tracking,doubleclick,googlesyndication,scorecardresearch,quantserve}**",
                         lambda r: r.abort())

        ok, fail = [], []

        for filename, url, dest in to_run:
            print(f"  GET   {filename}")
            print(f"        {url[:90]}")

            img_url = await get_image_url(page, url)

            # Try fallback
            if not img_url and filename in FALLBACKS and FALLBACKS[filename]:
                fb = FALLBACKS[filename]
                print(f"        fallback > {fb[:80]}")
                img_url = await get_image_url(page, fb)

            if not img_url:
                print(f"  FAIL  no image URL found\n")
                fail.append(filename)
                continue

            if img_url.startswith("//"):
                img_url = "https:" + img_url

            print(f"        > {img_url[:90]}")
            data = download_bytes(img_url)

            if data:
                dest.write_bytes(data)
                print(f"  OK    {filename} ({len(data) // 1024}KB)\n")
                ok.append(filename)
            else:
                print(f"  FAIL  download error\n")
                fail.append(filename)

        await browser.close()

    print("\n" + "=" * 60)
    print(f"  Done: {len(ok)} ok,  {len(fail)} still missing")

    if fail:
        print("\n  MANUAL DOWNLOAD NEEDED:")
        manual = {
            "psu-silverstone-1000w.jpg": "SilverStone HELA 1000W Platinum PSU — search Newegg/B&H",
            "psu-corsair-ax1200i.jpg":   "Corsair AX1200i Titanium PSU — corsair.com product page",
            "psu-corsair-ax1600i.jpg":   "Corsair AX1600i Titanium PSU — corsair.com product page",
            "psu-silverstone-2050w.jpg": "SilverStone HELA 2050W — silverstonetek.com",
            "psu-dual-1000w.jpg":        "Any dual-PSU rackmount photo — use psu-silverstone-1000w.jpg as substitute",
            "fans-noctua-nfa14.jpg":     "Noctua NF-A14 industrialPPC-3000 PWM — noctua.at or Newegg",
            "case-enthoo-pro2.jpg":      "Phanteks Enthoo Pro 2 Server — phanteks.com or Newegg",
            "case-o11d-xl.jpg":          "Lian Li O11D EVO XL — lian-li.com or Newegg",
            "case-7000d.jpg":            "Corsair 7000D Airflow — corsair.com or Newegg",
            "case-rm44.jpg":             "SilverStone RM44 4U Rack — silverstonetek.com",
            "gpu-arc-b70.jpg":           "Intel Arc Pro B70 — Newegg listing N82E16814883008",
            "ram-ddr5-rdimm.jpg":        "DDR5 RDIMM ECC server RAM sticks — Kingston/Crucial Newegg",
            "cpu-7845wx.jpg":            "AMD Threadripper Pro 7845WX box — Newegg listing",
            "cpu-7975wx.jpg":            "AMD Threadripper Pro 7975WX box — Newegg listing",
            "cpu-7995wx.jpg":            "AMD Threadripper Pro 7995WX box — Newegg listing",
            "cooling-noctua-u14s.jpg":   "Noctua NH-U14S TR5 cooler — noctua.at or Newegg",
            "cooling-custom-loop.jpg":   "EKWB custom loop kit — ekwb.com or Newegg",
            "storage-micron-9400.jpg":   "Micron 9400 U.3 SSD — micron.com or B&H",
        }
        for f in fail:
            tip = manual.get(f, "")
            print(f"    hardware/{f}")
            if tip:
                print(f"      ^ {tip}")

    print("\n  hardware/ folder contents:")
    for f in sorted(OUT.iterdir()):
        print(f"    {f.name:45s}  {f.stat().st_size // 1024}KB")
    print("=" * 60)


asyncio.run(main())
