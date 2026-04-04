#!/usr/bin/env python3
"""
Fix missing screenshots for OpenAI and Kimi logos.
"""

import asyncio
import os
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "vlm_screenshots")

async def capture_openai_screenshot():
    """Capture OpenAI screenshot with longer timeout."""
    print("Capturing OpenAI screenshot with extended timeout...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        try:
            # Try with longer timeout and 'load' instead of 'networkidle'
            await page.goto('https://openai.com/', wait_until='load', timeout=60000)
            await asyncio.sleep(3)
            
            screenshot_path = os.path.join(SCREENSHOTS_DIR, "gpt5.4_screenshot.png")
            await page.screenshot(path=screenshot_path, full_page=False)
            print(f"[OK] Screenshot saved: {screenshot_path}")
        except Exception as e:
            print(f"[WARN] Failed with 'load': {str(e)}")
            # Try with domcontentloaded as fallback
            try:
                await page.goto('https://openai.com/', wait_until='domcontentloaded', timeout=30000)
                await asyncio.sleep(3)
                
                screenshot_path = os.path.join(SCREENSHOTS_DIR, "gpt5.4_screenshot.png")
                await page.screenshot(path=screenshot_path, full_page=False)
                print(f"[OK] Screenshot saved (fallback): {screenshot_path}")
            except Exception as e2:
                print(f"[ERROR] Failed to capture OpenAI: {str(e2)}")
        
        await browser.close()

async def download_kimi_logo():
    """Try to download Kimi logo from alternative sources."""
    print("\nDownloading Kimi logo...")
    
    logo_urls = [
        "https://kimi.moonshot.cn/favicon.ico",
        "https://moonshot.cn/favicon.ico",
        "https://api.moonshot.cn/favicon.ico",
    ]
    
    import urllib.request
    import ssl
    
    # Create SSL context that doesn't verify certificates
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    for url in logo_urls:
        try:
            print(f"Trying: {url}")
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            with urllib.request.urlopen(req, timeout=10, context=ssl_context) as response:
                if response.status == 200:
                    logo_path = os.path.join(SCREENSHOTS_DIR, "kimik2.5_logo.png")
                    with open(logo_path, 'wb') as f:
                        f.write(response.read())
                    print(f"[OK] Logo downloaded: {logo_path}")
                    return
        except Exception as e:
            print(f"[WARN] Failed for {url}: {str(e)}")
    
    # If download fails, take a screenshot of the Moonshot website header
    print("[INFO] Trying to capture header from Moonshot website...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720}
        )
        page = await context.new_page()
        
        try:
            await page.goto('https://moonshot.cn/', wait_until='load', timeout=30000)
            await asyncio.sleep(2)
            
            # Try to find and screenshot the logo
            logo_selectors = ['header img', 'nav img', 'img[alt*="logo"]', '.logo img', 'a img']
            for selector in logo_selectors:
                try:
                    logo_element = await page.query_selector(selector)
                    if logo_element:
                        logo_path = os.path.join(SCREENSHOTS_DIR, "kimik2.5_logo.png")
                        await logo_element.screenshot(path=logo_path)
                        print(f"[OK] Logo captured from moonshot.cn: {logo_path}")
                        await browser.close()
                        return
                except:
                    continue
            
            # Take header screenshot as fallback
            header = await page.query_selector('header') or await page.query_selector('nav')
            if header:
                logo_path = os.path.join(SCREENSHOTS_DIR, "kimik2.5_logo.png")
                await header.screenshot(path=logo_path)
                print(f"[OK] Header captured as logo: {logo_path}")
            
        except Exception as e:
            print(f"[ERROR] Failed to capture Moonshot header: {str(e)}")
        
        await browser.close()

async def main():
    print("="*60)
    print("Fixing Missing Captures")
    print("="*60)
    
    await capture_openai_screenshot()
    await download_kimi_logo()
    
    print("\n" + "="*60)
    print("Done!")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(main())