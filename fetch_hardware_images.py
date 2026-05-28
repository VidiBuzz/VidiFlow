"""
Sovereign AI Node — Hardware Image Downloader
Downloads product images into ./hardware/ using Playwright + og:image scraping.
Run: python fetch_hardware_images.py
"""

import asyncio
import os
import re
import urllib.request
import urllib.error
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path("M:/code/vidismart/hardware")
OUT.mkdir(parents=True, exist_ok=True)

PRODUCTS = [
    # (output_filename,  url_to_scrape)

    # ── Cases ──────────────────────────────────────────────────────────────────
    ("case-define7xl.jpg",
     "https://www.fractal-design.com/products/cases/define/define-7-xl/black/"),

    ("case-enthoo-pro2.jpg",
     "https://www.phanteks.com/Enthoo-Pro2-Server.html"),

    ("case-o11d-xl.jpg",
     "https://lian-li.com/product/o11d-evo-xl/"),

    ("case-7000d.jpg",
     "https://www.corsair.com/us/en/p/pc-cases/cc-9011218-ww/7000d-airflow-full-tower-atx-pc-case-black-cc-9011218-ww"),

    ("case-rm44.jpg",
     "https://www.silverstonetek.com/en/product/info/server-rack/RM44/"),

    # ── Motherboards ───────────────────────────────────────────────────────────
    ("mobo-wrx90.jpg",
     "https://www.asus.com/motherboards-components/motherboards/workstation/pro-ws-wrx90e-sage-se/"),

    ("mobo-trx50.jpg",
     "https://www.asus.com/motherboards-components/motherboards/workstation/pro-ws-trx50-sage-wifi/"),

    # ── CPUs ───────────────────────────────────────────────────────────────────
    ("cpu-7845wx.jpg",
     "https://www.amd.com/en/products/cpu/amd-ryzen-threadripper-pro-7845wx"),

    ("cpu-7975wx.jpg",
     "https://www.amd.com/en/products/cpu/amd-ryzen-threadripper-pro-7975wx"),

    ("cpu-7995wx.jpg",
     "https://www.amd.com/en/products/cpu/amd-ryzen-threadripper-pro-7995wx"),

    # ── Cooling ────────────────────────────────────────────────────────────────
    ("cooling-noctua-u14s.jpg",
     "https://noctua.at/en/nh-u14s-tr5-sp5"),

    ("cooling-aio-360.jpg",
     "https://www.corsair.com/us/en/p/cpu-coolers/cw-9060046-ww/icue-h150i-elite-capellix-xt-liquid-cpu-cooler-cw-9060046-ww"),

    ("cooling-custom-loop.jpg",
     "https://www.ekwb.com/shop/ek-quantum-power-kit-d-rgb-360d"),

    # ── GPUs ───────────────────────────────────────────────────────────────────
    ("gpu-arc-b70.jpg",
     "https://www.intel.com/content/www/us/en/products/sku/236839/intel-arc-pro-b70-graphics/specifications.html"),

    ("gpu-rtx4090.jpg",
     "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/"),

    ("gpu-rtx-a6000-ada.jpg",
     "https://www.nvidia.com/en-us/design-visualization/rtx-a6000/"),

    ("gpu-rtx6000ada.jpg",
     "https://www.nvidia.com/en-us/design-visualization/rtx-6000/"),

    ("gpu-h100-pcie.jpg",
     "https://www.nvidia.com/en-us/data-center/h100/"),

    # ── RAM ────────────────────────────────────────────────────────────────────
    ("ram-ddr5-rdimm.jpg",
     "https://www.crucial.com/memory/server-ddr5/mte8g1rtf1a4ec-d-cr"),

    # ── Storage ────────────────────────────────────────────────────────────────
    ("storage-wd-black.jpg",
     "https://www.westerndigital.com/products/internal-drives/wd-black-sn850x-nvme-ssd#WDS100T2X0E"),

    ("storage-firecuda.jpg",
     "https://www.seagate.com/internal-hard-drives/ssd/firecuda/firecuda-540-ssd/"),

    ("storage-micron-9400.jpg",
     "https://www.micron.com/products/ssd/product-lines/9400"),
]


def download_url(url: str, dest: Path) -> bool:
    """Download a URL to dest using urllib. Returns True on success."""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; image-fetch/1.0)"}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
        if len(data) < 2000:
            return False  # probably an error page snippet
        dest.write_bytes(data)
        return True
    except Exception:
        return False


async def get_og_image(page, url: str) -> str | None:
    """Navigate to url, return og:image content or None."""
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=25000)
        # Try og:image first (works on most manufacturer/retailer pages)
        og = await page.get_attribute('meta[property="og:image"]', "content")
        if og and og.startswith("http"):
            return og
        # Fallback: twitter:image
        tw = await page.get_attribute('meta[name="twitter:image"]', "content")
        if tw and tw.startswith("http"):
            return tw
        # Fallback: largest visible img
        imgs = await page.query_selector_all("img")
        best_src = None
        best_size = 0
        for img in imgs[:30]:
            try:
                box = await img.bounding_box()
                if box and box["width"] > 150 and box["height"] > 150:
                    area = box["width"] * box["height"]
                    if area > best_size:
                        src = await img.get_attribute("src")
                        if src and ("http" in src or src.startswith("/")):
                            best_size = area
                            best_src = src
            except Exception:
                continue
        return best_src
    except Exception as e:
        print(f"  Page error: {e}")
        return None


async def main():
    print(f"\nSovereign AI Node - Downloading {len(PRODUCTS)} hardware images")
    print(f"Output: {OUT}\n")

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
        )
        page = await context.new_page()

        ok = []
        fail = []

        for filename, url in PRODUCTS:
            dest = OUT / filename
            if dest.exists() and dest.stat().st_size > 5000:
                print(f"  SKIP  {filename}  (already exists)")
                ok.append(filename)
                continue

            print(f"  GET   {filename}")
            print(f"        {url}")

            img_url = await get_og_image(page, url)

            if not img_url:
                print(f"  FAIL  {filename}  — no image found on page\n")
                fail.append(filename)
                continue

            # Make absolute if relative
            if img_url.startswith("//"):
                img_url = "https:" + img_url
            elif img_url.startswith("/"):
                from urllib.parse import urlparse
                base = urlparse(url)
                img_url = f"{base.scheme}://{base.netloc}{img_url}"

            print(f"        > {img_url[:90]}")
            success = download_url(img_url, dest)

            if success:
                size_kb = dest.stat().st_size // 1024
                print(f"  OK    {filename}  ({size_kb}KB)\n")
                ok.append(filename)
            else:
                print(f"  FAIL  {filename}  — download failed\n")
                fail.append(filename)

        await browser.close()

    print("\n" + "="*60)
    print(f"  Done: {len(ok)} downloaded,  {len(fail)} failed")
    if fail:
        print("\n  Still needed:")
        for f in fail:
            print(f"    hardware/{f}")
    print("="*60 + "\n")


asyncio.run(main())
