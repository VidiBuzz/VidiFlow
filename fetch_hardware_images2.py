"""
Round 2 — target the 11 failures + 3 bad successes with better sources.
Uses networkidle for JS-heavy sites and Newegg/BH as fallbacks.
"""

import asyncio
import urllib.request
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path("M:/code/vidismart/hardware")
OUT.mkdir(parents=True, exist_ok=True)

# (filename, primary_url, fallback_url_or_None)
TARGETS = [
    # ── Bad successes to replace ────────────────────────────────────────────
    # Arc B70 — got Intel logo; try Newegg
    ("gpu-arc-b70.jpg",
     "https://www.newegg.com/sparkle-computer-sb-b70-16g-d6-arc-pro-b70/p/N82E16814994035",
     None),

    # FireCuda — got promo banner; try Newegg
    ("storage-firecuda.jpg",
     "https://www.newegg.com/seagate-firecuda-540-internal-solid-state-drive-4tb/p/N82E16820185064",
     None),

    # Micron 9400 — got generic OG; try direct product on BH
    ("storage-micron-9400.jpg",
     "https://www.bhphotovideo.com/c/search?q=micron+9400+u.3+ssd&sts=ma",
     "https://www.micron.com/products/storage/ssd/9400-ssd"),

    # ── Cases (Newegg works well for these) ────────────────────────────────
    ("case-enthoo-pro2.jpg",
     "https://www.newegg.com/black-phanteks-enthoo-pro-2-server-edition-atx-full-tower/p/N82E16811854097",
     None),

    ("case-o11d-xl.jpg",
     "https://www.newegg.com/black-lian-li-o11d-evo-xl-atx-full-tower/p/N82E16811112645",
     None),

    ("case-7000d.jpg",
     "https://www.newegg.com/black-corsair-7000d-airflow-atx-full-tower/p/N82E16811139193",
     None),

    ("case-rm44.jpg",
     "https://www.newegg.com/silverstone-rm44/p/N82E16816935007",
     "https://www.newegg.com/silverstone-RM44/p/N82E16816935016"),

    # ── CPUs — AMD blocks headless; use B&H or Newegg ──────────────────────
    ("cpu-7845wx.jpg",
     "https://www.bhphotovideo.com/c/product/1830764-REG/amd_100_100001445wof_threadripper_pro_7845wx.html",
     "https://www.newegg.com/amd-ryzen-threadripper-pro-7845wx-12-core-3-7ghz/p/N82E16819113792"),

    ("cpu-7975wx.jpg",
     "https://www.bhphotovideo.com/c/product/1830762-REG/amd_100_100001443wof_ryzen_threadripper_pro.html",
     "https://www.newegg.com/amd-ryzen-threadripper-pro-7975wx-32-core-4ghz/p/N82E16819113797"),

    ("cpu-7995wx.jpg",
     "https://www.bhphotovideo.com/c/product/1830760-REG/amd_100_100001440wof_threadripper_pro_7995wx.html",
     "https://www.newegg.com/amd-ryzen-threadripper-pro-7995wx/p/N82E16819113790"),

    # ── Cooling ─────────────────────────────────────────────────────────────
    ("cooling-noctua-u14s.jpg",
     "https://www.bhphotovideo.com/c/product/1842823-REG/noctua_nh_u14s_tr5_sp5_nh_u14s_tr5_sp5_cpu_cooler.html",
     "https://www.newegg.com/noctua-nh-u14s-tr5-sp5/p/N82E16835608141"),

    ("cooling-aio-360.jpg",
     "https://www.newegg.com/corsair-icue-h150i-elite-rgb-liquid-cpu-cooler/p/N82E16835181299",
     None),

    ("cooling-custom-loop.jpg",
     "https://www.newegg.com/ekwb-ek-quantum-power-kit-360d/p/N82E16835355062",
     "https://www.newegg.com/ekwb/p/N82E16835355062"),

    # ── RAM ─────────────────────────────────────────────────────────────────
    ("ram-ddr5-rdimm.jpg",
     "https://www.bhphotovideo.com/c/search?q=ddr5+rdimm+ecc+server+memory&sts=ma",
     "https://www.newegg.com/crucial-64gb-288-pin-ddr5-sdram-ecc/p/N82E16820156308"),
]


def download_url(url: str, dest: Path) -> bool:
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36"}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = resp.read()
        if len(data) < 4000:
            return False
        dest.write_bytes(data)
        return True
    except Exception as e:
        print(f"        download err: {e}")
        return False


async def get_best_image(page, url: str) -> str | None:
    try:
        # Use networkidle for JS-heavy retailer pages
        resp = await page.goto(url, wait_until="networkidle", timeout=35000)
        if resp and resp.status >= 400:
            print(f"        HTTP {resp.status}")
            return None
    except Exception as e:
        print(f"        goto err: {e}")
        return None

    # 1. og:image
    for sel, attr in [
        ('meta[property="og:image"]', "content"),
        ('meta[name="twitter:image"]', "content"),
        ('meta[name="twitter:image:src"]', "content"),
    ]:
        try:
            val = await page.locator(sel).first.get_attribute(attr, timeout=4000)
            if val and val.startswith("http") and not any(x in val for x in ["logo", "favicon", "icon", "facebook"]):
                return val
        except Exception:
            pass

    # 2. Newegg-specific: main product image
    for sel in ["#A2ImgCollection img", ".mainSlide img", ".product-view-img-original", ".swiper-slide img"]:
        try:
            src = await page.locator(sel).first.get_attribute("src", timeout=3000)
            if src and src.startswith("http") and len(src) > 30:
                return src
        except Exception:
            pass

    # 3. Largest visible img fallback
    imgs = await page.query_selector_all("img")
    best_src, best_size = None, 0
    for img in imgs[:40]:
        try:
            box = await img.bounding_box()
            if box and box["width"] > 200 and box["height"] > 200:
                area = box["width"] * box["height"]
                if area > best_size:
                    src = await img.get_attribute("src") or ""
                    if src.startswith("http") and not any(x in src.lower() for x in ["logo", "icon", "favicon", "sprite", "banner", "ad-"]):
                        best_size = area
                        best_src = src
        except Exception:
            continue
    return best_src


async def main():
    print(f"\nRound 2 - fixing {len(TARGETS)} images\n")

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            extra_http_headers={"Accept-Language": "en-US,en;q=0.9"}
        )
        page = await context.new_page()

        ok, fail = [], []

        for filename, url, fallback in TARGETS:
            dest = OUT / filename
            print(f"  GET   {filename}")
            print(f"        {url[:80]}")

            img_url = await get_best_image(page, url)

            # Try fallback if primary failed
            if not img_url and fallback:
                print(f"        trying fallback...")
                img_url = await get_best_image(page, fallback)

            if not img_url:
                print(f"  FAIL  {filename} - no image URL found\n")
                fail.append(filename)
                continue

            if img_url.startswith("//"):
                img_url = "https:" + img_url
            elif img_url.startswith("/"):
                from urllib.parse import urlparse
                base = urlparse(url)
                img_url = f"{base.scheme}://{base.netloc}{img_url}"

            print(f"        > {img_url[:80]}")
            if download_url(img_url, dest):
                size_kb = dest.stat().st_size // 1024
                print(f"  OK    {filename} ({size_kb}KB)\n")
                ok.append(filename)
            else:
                print(f"  FAIL  {filename} - download error\n")
                fail.append(filename)

        await browser.close()

    print("\n" + "="*60)
    print(f"  Done: {len(ok)} ok,  {len(fail)} still missing")
    if fail:
        print("\n  Still needed (manual):")
        for f in fail:
            print(f"    hardware/{f}")
    print("="*60)


asyncio.run(main())
