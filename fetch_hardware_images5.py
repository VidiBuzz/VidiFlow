"""
Round 5 - Fix the 4 images that got Newegg logos (8KB) due to bad product IDs.
Also tries direct manufacturer CDN URLs to avoid JS rendering entirely.
"""

import asyncio
import urllib.request
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path("M:/code/vidismart/hardware")

# Direct CDN image URLs to try first (no page rendering needed)
DIRECT_URLS = {
    "fans-noctua-nfa14.jpg": [
        # Noctua serves product images at predictable paths
        "https://noctua.at/media/wysiwyg/products/nf-a14-industrialppc-3000-pwm/nf-a14-industrialppc-3000-pwm_sq.jpg",
        "https://noctua.at/media/catalog/product/n/f/nf-a14-industrialppc-3000-pwm_1.jpg",
        "https://noctua.at/pub/media/catalog/product/n/f/nf-a14-industrialppc_1.jpg",
    ],
    "psu-silverstone-2050w.jpg": [
        # SilverStone product images
        "https://www.silverstonetek.com/en/img/products/SST-HA2050R-PM-Series.jpg",
        "https://www.silverstonetek.com/img/mb/SST-HA2050R-PM.jpg",
    ],
    "cooling-custom-loop.jpg": [
        # EK Water Blocks product images
        "https://www.ekwb.com/media/catalog/product/e/k/ek-quantum-power-kit-360d-rgb.jpg",
        "https://www.ekwb.com/media/catalog/product/e/k/ek-quantum-power-kit-360-d-rgb_1.jpg",
    ],
    "storage-micron-9400.jpg": [
        # Micron product images
        "https://media.kingston.com/kingston/product/ktc-product-ssd-9400-pro-1-xl.jpg",
        "https://www.bhphotovideo.com/images/images2500x2500/micron_mtfdkcc6t4tgj_1ab1zabyy_6_4tb_9400_pro_u_3_1727882.jpg",
    ],
}

# Newegg page URLs (scraped with Playwright) as fallback
NEWEGG_URLS = {
    "fans-noctua-nfa14.jpg":   "https://www.newegg.com/noctua-nf-a14-industrialppc-3000-pwm/p/N82E16835608128",
    "psu-silverstone-2050w.jpg": "https://www.newegg.com/silverstone-hela-platinum-series-st-HA2050-PM/p/N82E16817256257",
    "cooling-custom-loop.jpg": "https://www.newegg.com/ekwb-ek-quantum-power-kit-d-360/p/2AM-006R-000S4",
    "storage-micron-9400.jpg": "https://www.bhphotovideo.com/c/search?q=micron+9400+nvme&sts=ma",
}

SKIP = ["logo", "favicon", "icon", "facebook", "twitter", "placeholder",
        "sprite", "badge", "banner", "ad-", "loading", "blank",
        "webresource", "themes/nest", "color_logo", "full_color"]


def try_direct(url: str) -> bytes | None:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
        "Referer": "https://www.google.com/",
        "Accept": "image/avif,image/webp,image/jpeg,image/png,*/*",
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
        if len(data) > 15000:
            return data
        print(f"        too small ({len(data)}B): {url[:60]}")
        return None
    except Exception as e:
        print(f"        direct err: {e}")
        return None


async def get_image_url(page, url: str) -> str | None:
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=35000)
        await page.wait_for_timeout(3000)
    except Exception as e:
        print(f"        goto err: {e}")
        return None

    for sel, attr in [
        ('meta[property="og:image"]', "content"),
        ('meta[name="twitter:image"]', "content"),
    ]:
        try:
            val = await page.locator(sel).first.get_attribute(attr, timeout=3000)
            if val and val.startswith("http") and not any(s in val.lower() for s in SKIP):
                return val
        except Exception:
            pass

    # Newegg CDN with skip filter
    try:
        imgs = await page.locator("img[src*='neweggimages.com']").all()
        for loc in imgs[:5]:
            src = await loc.get_attribute("src", timeout=2000)
            if src and src.startswith("http") and not any(s in src.lower() for s in SKIP):
                return src
    except Exception:
        pass

    # Largest visible image
    imgs = await page.query_selector_all("img")
    best_src, best_size = None, 0
    for img in imgs[:60]:
        try:
            box = await img.bounding_box()
            if box and box["width"] > 150 and box["height"] > 150:
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
    targets = ["fans-noctua-nfa14.jpg", "psu-silverstone-2050w.jpg",
               "cooling-custom-loop.jpg", "storage-micron-9400.jpg"]

    print("\nRound 5 - Rescuing 4 logo-placeholder images\n")

    ok, fail = [], []

    # Try direct CDN URLs first (no browser needed)
    still_needed = []
    for filename in targets:
        dest = OUT / filename
        print(f"  Trying direct CDNs for {filename}...")
        found = False
        for url in DIRECT_URLS.get(filename, []):
            print(f"    {url[:80]}")
            data = try_direct(url)
            if data:
                dest.write_bytes(data)
                print(f"  OK    {filename} ({len(data) // 1024}KB) via direct CDN\n")
                ok.append(filename)
                found = True
                break
        if not found:
            print(f"  -> Direct CDN failed, will try Playwright\n")
            still_needed.append(filename)

    if still_needed:
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(
                headless=True,
                args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
            )
            ctx = await browser.new_context(
                viewport={"width": 1440, "height": 900},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
                extra_http_headers={"Accept-Language": "en-US,en;q=0.9"}
            )
            page = await ctx.new_page()
            await page.route("**/{ads,analytics,tracking,doubleclick,googlesyndication}**", lambda r: r.abort())

            for filename in still_needed:
                dest = OUT / filename
                url = NEWEGG_URLS[filename]
                print(f"  GET   {filename}")
                print(f"        {url[:90]}")

                img_url = await get_image_url(page, url)

                if not img_url:
                    print(f"  FAIL  no usable image URL\n")
                    fail.append(filename)
                    continue

                if img_url.startswith("//"):
                    img_url = "https:" + img_url

                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
                }
                try:
                    req = urllib.request.Request(img_url, headers=headers)
                    with urllib.request.urlopen(req, timeout=25) as resp:
                        data = resp.read()
                    if len(data) > 8000:
                        dest.write_bytes(data)
                        print(f"  OK    {filename} ({len(data) // 1024}KB)\n")
                        ok.append(filename)
                    else:
                        print(f"  FAIL  data too small ({len(data)}B)\n")
                        fail.append(filename)
                except Exception as e:
                    print(f"  FAIL  {e}\n")
                    fail.append(filename)

            await browser.close()

    print("=" * 60)
    print(f"  Done: {len(ok)} ok,  {len(fail)} still missing")
    if fail:
        print("\n  MANUAL DOWNLOAD NEEDED (place in hardware/ folder):")
        tips = {
            "fans-noctua-nfa14.jpg":     "Noctua NF-A14 industrialPPC-3000 PWM — noctua.at product page > right-click save product image",
            "psu-silverstone-2050w.jpg": "SilverStone HELA 2050W — silverstonetek.com/en/product/info/power-supplies/SST-HA2050R-PM/ > save product photo",
            "cooling-custom-loop.jpg":   "EKWB EK-Quantum Power Kit D-360 — ekwb.com > right-click save product image",
            "storage-micron-9400.jpg":   "Micron 9400 U.3 SSD — micron.com or search B&H Photo for 'Micron 9400' > save product image",
        }
        for f in fail:
            print(f"\n  hardware/{f}")
            print(f"  ^ {tips.get(f,'')}")

    print("\n  Final hardware/ contents:")
    for f in sorted(OUT.iterdir()):
        size = f.stat().st_size // 1024
        flag = " <-- STILL SMALL" if size < 10 else ""
        print(f"    {f.name:45s}  {size}KB{flag}")
    print("=" * 60)


asyncio.run(main())
