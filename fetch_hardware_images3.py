"""
Round 3 - all verified Newegg URLs. Uses domcontentloaded + short wait (faster than networkidle).
Also re-downloads low-quality files from rounds 1/2.
"""

import asyncio
import urllib.request
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path("M:/code/vidismart/hardware")
OUT.mkdir(parents=True, exist_ok=True)

# (filename, newegg_or_site_url, force_redownload)
# CPU 7845WX/7975WX use a 7965WX listing — same chip family, identical box art.
TARGETS = [
    # Bad quality from round 1/2 — force re-download
    ("case-enthoo-pro2.jpg",   True,
     "https://www.newegg.com/phanteks-full-tower-enthoo-pro-2-server-edition-steel-chassis-computer-case-black-ph-es620ptg-bk02/p/N82E16811854127"),

    ("storage-micron-9400.jpg", True,
     "https://www.newegg.com/p/pl?d=micron+9400+u.3"),

    # New failures — correct Newegg URLs
    ("gpu-arc-b70.jpg",         False,
     "https://www.newegg.com/intel-arc-pro-b70-32gb-graphics-card/p/N82E16814883008"),

    ("storage-firecuda.jpg",    False,
     "https://www.newegg.com/seagate-2tb-firecuda-540/p/N82E16820248242"),

    ("case-o11d-xl.jpg",        False,
     "https://www.newegg.com/lian-li-atx-mid-tower-aluminum-steel-tempered-glass-cases-black-o11dexl-x/p/2AM-000Z-000B4"),

    ("case-7000d.jpg",          False,
     "https://www.newegg.com/p/N82E16811139170"),

    ("case-rm44.jpg",           False,
     "https://www.newegg.com/p/2AM-006F-001D2"),

    ("cpu-7845wx.jpg",          False,
     "https://www.newegg.com/amd-ryzen-threadripper-7000-series-ryzen-threadripper-pro-7965wx-storm-peak-socket-str5-desktop-cpu-processor/p/N82E16819113805"),

    ("cpu-7975wx.jpg",          False,
     "https://www.newegg.com/amd-ryzen-threadripper-7000-series-ryzen-threadripper-pro-7985wx-storm-peak-socket-str5-desktop-cpu-processor/p/N82E16819113809"),

    ("cpu-7995wx.jpg",          False,
     "https://www.newegg.com/amd-ryzen-threadripper-7000-series-ryzen-threadripper-pro-7995wx-storm-peak-socket-str5-desktop-cpu-processor/p/N82E16819113810"),

    ("cooling-noctua-u14s.jpg", False,
     "https://www.newegg.com/noctua-nh-u14s-tr5-sp6/p/13C-0005-00336"),

    ("cooling-aio-360.jpg",     False,
     "https://www.newegg.com/corsair-liquid-cooling-icue-link-397mm-amd-am5-am4-strx4-intel-1700-1200-115x-2066-2011-3-2011-black/p/N82E16835181368"),

    ("cooling-custom-loop.jpg", False,
     "https://www.newegg.com/ekwb-liquid-cooling-system/p/37B-000B-003M7"),

    ("ram-ddr5-rdimm.jpg",      False,
     "https://www.newegg.com/kingston-64gb/p/N82E16820242881"),
]


def download_bytes(url: str) -> bytes | None:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
        "Referer": "https://www.newegg.com/"
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = resp.read()
        return data if len(data) > 5000 else None
    except Exception as e:
        print(f"        dl err: {e}")
        return None


async def get_image_url(page, url: str) -> str | None:
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        # Short pause for JS image loading
        await page.wait_for_timeout(2500)
    except Exception as e:
        print(f"        goto err: {e}")
        return None

    # og:image / twitter:image (most reliable)
    for sel, attr in [
        ('meta[property="og:image"]', "content"),
        ('meta[name="twitter:image"]', "content"),
        ('meta[property="og:image:secure_url"]', "content"),
    ]:
        try:
            val = await page.locator(sel).first.get_attribute(attr, timeout=3000)
            if val and val.startswith("http"):
                # Skip logos and generic OG images
                skip = ["logo", "favicon", "icon", "facebook", "twitter", "og-image.png", "placeholder"]
                if not any(s in val.lower() for s in skip):
                    return val
        except Exception:
            pass

    # Newegg CDN direct image (c1.neweggimages.com)
    try:
        img = await page.locator("img[src*='neweggimages.com']").first.get_attribute("src", timeout=3000)
        if img and img.startswith("http"):
            return img
    except Exception:
        pass

    # Main product image selectors (Newegg-specific)
    for sel in [
        ".product-main-image img",
        "#A2ImgCollection img",
        ".mainSlide img",
        "[class*='ProductGallery'] img",
        ".swiper-slide-active img",
    ]:
        try:
            src = await page.locator(sel).first.get_attribute("src", timeout=2000)
            if src and src.startswith("http") and not any(s in src.lower() for s in ["logo", "icon", "placeholder"]):
                return src
        except Exception:
            pass

    # Largest visible image fallback
    imgs = await page.query_selector_all("img")
    best_src, best_size = None, 0
    for img in imgs[:50]:
        try:
            box = await img.bounding_box()
            if box and box["width"] > 200 and box["height"] > 200:
                area = box["width"] * box["height"]
                if area > best_size:
                    src = await img.get_attribute("src") or ""
                    skip = ["logo", "icon", "favicon", "sprite", "banner", "ad-", "placeholder", "loading"]
                    if src.startswith("http") and not any(s in src.lower() for s in skip):
                        best_size = area
                        best_src = src
        except Exception:
            continue
    return best_src


async def main():
    to_run = []
    for filename, force, url in TARGETS:
        dest = OUT / filename
        if dest.exists() and dest.stat().st_size > 15000 and not force:
            print(f"  SKIP  {filename} ({dest.stat().st_size // 1024}KB)")
            continue
        to_run.append((filename, url, dest))

    if not to_run:
        print("All images already present.")
        return

    print(f"\nRound 3 - fetching {len(to_run)} images\n")

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
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
            }
        )
        page = await context.new_page()
        # Block ads/trackers to speed things up
        await page.route("**/{ads,analytics,tracking,doubleclick,googlesyndication}**", lambda r: r.abort())

        ok, fail = [], []

        for filename, url, dest in to_run:
            print(f"  GET   {filename}")
            print(f"        {url[:90]}")

            img_url = await get_image_url(page, url)

            if not img_url:
                print(f"  FAIL  no image URL\n")
                fail.append(filename)
                continue

            if img_url.startswith("//"):
                img_url = "https:" + img_url

            print(f"        > {img_url[:90]}")
            data = download_bytes(img_url)

            if data:
                dest.write_bytes(data)
                print(f"  OK    {filename} ({len(data)//1024}KB)\n")
                ok.append(filename)
            else:
                print(f"  FAIL  download error\n")
                fail.append(filename)

        await browser.close()

    print("\n" + "="*60)
    print(f"  Done: {len(ok)} ok,  {len(fail)} still missing")
    if fail:
        print("\n  Manual download needed:")
        for f in fail:
            print(f"    hardware/{f}")

    # Final inventory
    print("\n  hardware/ folder contents:")
    for f in sorted(OUT.iterdir()):
        print(f"    {f.name:40s}  {f.stat().st_size//1024}KB")
    print("="*60)


asyncio.run(main())
