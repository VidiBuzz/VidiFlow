#!/usr/bin/env python3
"""
Capture screenshots of agent orchestration platform landing pages.
"""

import asyncio
import os
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "agent_screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

PLATFORMS = {
    "nemoclaw": {
        "name": "NVIDIA NemoClaw",
        "url": "https://developer.nvidia.com/agentiq",
    },
    "openclaw": {
        "name": "OpenClaw",
        "url": "https://github.com/openclaw/openclaw",
    },
    "openfang": {
        "name": "OpenFang",
        "url": "https://openfang.sh",
    },
    "zeroclaw": {
        "name": "ZeroClaw",
        "url": "https://github.com/theonlyhennygod/zeroclaw",
    },
    "msagent": {
        "name": "Microsoft Agent Framework",
        "url": "https://learn.microsoft.com/en-us/agent-framework/overview/",
    },
    "crewai": {
        "name": "CrewAI",
        "url": "https://crewai.com",
    },
    "dify": {
        "name": "Dify",
        "url": "https://dify.ai",
    },
    "flowise": {
        "name": "Flowise",
        "url": "https://flowiseai.com",
    }
}

async def capture_screenshot(page, platform_id, platform_info):
    print(f"Capturing: {platform_info['name']}")
    try:
        await page.goto(platform_info['url'], wait_until='load', timeout=45000)
        await asyncio.sleep(3)
        screenshot_path = os.path.join(SCREENSHOTS_DIR, f"{platform_id}_screenshot.png")
        await page.screenshot(path=screenshot_path, full_page=False)
        print(f"  [OK] Screenshot saved")
        return True
    except Exception as e:
        print(f"  [ERROR] {str(e)}")
        return False

async def capture_logo(page, platform_id, platform_info):
    print(f"  Looking for logo...")
    try:
        logo_selectors = [
            'header img', 'nav img', 'img[alt*="logo"]', 'img[alt*="Logo"]',
            'svg', '.logo img', '#logo img', 'a[href="/"] img'
        ]
        for selector in logo_selectors:
            try:
                logo_element = await page.query_selector(selector)
                if logo_element:
                    logo_path = os.path.join(SCREENSHOTS_DIR, f"{platform_id}_logo.png")
                    await logo_element.screenshot(path=logo_path)
                    print(f"  [OK] Logo saved")
                    return True
            except:
                continue
        
        header = await page.query_selector('header') or await page.query_selector('nav')
        if header:
            logo_path = os.path.join(SCREENSHOTS_DIR, f"{platform_id}_logo.png")
            await header.screenshot(path=logo_path)
            print(f"  [OK] Header saved as logo")
            return True
        return False
    except Exception as e:
        print(f"  [WARN] Logo error: {str(e)}")
        return False

async def main():
    print("=" * 60)
    print("Agent Platform Screenshots Capture")
    print("=" * 60)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = await context.new_page()
        
        results = {}
        for platform_id, platform_info in PLATFORMS.items():
            print(f"\n{platform_info['name']}:")
            screenshot_ok = await capture_screenshot(page, platform_id, platform_info)
            logo_ok = await capture_logo(page, platform_id, platform_info)
            results[platform_id] = {'screenshot': screenshot_ok, 'logo': logo_ok}
        
        await browser.close()
    
    print("\n" + "=" * 60)
    print("CAPTURE SUMMARY")
    print("=" * 60)
    for platform_id, result in results.items():
        status = "[OK]" if result['screenshot'] else "[WARN]"
        print(f"{status} {PLATFORMS[platform_id]['name']}")
    print(f"\nFiles saved to: {SCREENSHOTS_DIR}")

if __name__ == "__main__":
    asyncio.run(main())