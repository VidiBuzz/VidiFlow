#!/usr/bin/env python3
"""
Capture screenshots of VLM model landing pages for comparison page.
"""

import asyncio
import os
from playwright.async_api import async_playwright

# Create screenshots directory if it doesn't exist
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "vlm_screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# VLM Model landing page URLs
MODELS = {
    "qwen3.5": {
        "name": "Qwen 3.5 (Alibaba Cloud)",
        "url": "https://qwen.ai/",
        "logo_url": "https://qwen.ai/favicon.ico"
    },
    "gpt5.4": {
        "name": "GPT-5.4 (OpenAI)",
        "url": "https://openai.com/",
        "logo_url": "https://openai.com/favicon.ico"
    },
    "gemini3pro": {
        "name": "Gemini 3 Pro (Google DeepMind)",
        "url": "https://deepmind.google/technologies/gemini/",
        "logo_url": "https://deepmind.google/favicon.ico"
    },
    "mimov2omni": {
        "name": "MiMo V2 Omni (Xiaomi)",
        "url": "https://aistudio.xiaomimimo.com/#/",
        "logo_url": "https://aistudio.xiaomimimo.com/favicon.ico"
    },
    "kimik2.5": {
        "name": "Kimi K2.5 (Moonshot AI)",
        "url": "https://kimi.moonshot.cn/",
        "logo_url": "https://kimi.moonshot.cn/favicon.ico"
    }
}

async def capture_screenshot(page, model_id, model_info):
    """Capture screenshot of a model's landing page."""
    print(f"\n{'='*60}")
    print(f"Capturing: {model_info['name']}")
    print(f"URL: {model_info['url']}")
    print(f"{'='*60}")
    
    try:
        # Navigate to the page
        await page.goto(model_info['url'], wait_until='networkidle', timeout=30000)
        await asyncio.sleep(2)  # Wait for any animations
        
        # Take screenshot
        screenshot_path = os.path.join(SCREENSHOTS_DIR, f"{model_id}_screenshot.png")
        await page.screenshot(path=screenshot_path, full_page=False)
        print(f"[OK] Screenshot saved: {screenshot_path}")
        
        return True
    except Exception as e:
        print(f"[ERROR] Error capturing {model_id}: {str(e)}")
        return False

async def capture_logo(page, model_id, model_info):
    """Capture logo from the page."""
    try:
        # Try to find and screenshot the logo
        logo_selectors = [
            'header img[src*="logo"]',
            'nav img[src*="logo"]',
            'header svg',
            'nav svg',
            'img[alt*="logo"]',
            'img[alt*="Logo"]',
            'a[href="/"] img',
            '.logo img',
            '#logo img',
            'img[width="100"]',
            'img[src*="favicon"]'
        ]
        
        for selector in logo_selectors:
            try:
                logo_element = await page.query_selector(selector)
                if logo_element:
                    logo_path = os.path.join(SCREENSHOTS_DIR, f"{model_id}_logo.png")
                    await logo_element.screenshot(path=logo_path)
                    print(f"[OK] Logo saved: {logo_path}")
                    return True
            except:
                continue
        
        # If no logo found, take a small screenshot of the header area
        header = await page.query_selector('header') or await page.query_selector('nav')
        if header:
            logo_path = os.path.join(SCREENSHOTS_DIR, f"{model_id}_logo.png")
            await header.screenshot(path=logo_path)
            print(f"[OK] Header saved as logo: {logo_path}")
            return True
            
        print(f"[WARN] Could not find logo for {model_id}")
        return False
        
    except Exception as e:
        print(f"[ERROR] Error capturing logo for {model_id}: {str(e)}")
        return False

async def main():
    """Main function to capture all screenshots."""
    print("\n" + "="*80)
    print("VLM Model Landing Page Screenshot Capture")
    print("="*80)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        results = {}
        for model_id, model_info in MODELS.items():
            print(f"\nProcessing {model_info['name']}...")
            
            # Capture screenshot
            screenshot_success = await capture_screenshot(page, model_id, model_info)
            
            # Capture logo
            logo_success = await capture_logo(page, model_id, model_info)
            
            results[model_id] = {
                'screenshot': screenshot_success,
                'logo': logo_success
            }
        
        await browser.close()
    
    # Print summary
    print("\n" + "="*80)
    print("CAPTURE SUMMARY")
    print("="*80)
    
    for model_id, result in results.items():
        status = "[OK]" if result['screenshot'] and result['logo'] else "[WARN]"
        print(f"{status} {MODELS[model_id]['name']}: Screenshot={result['screenshot']}, Logo={result['logo']}")
    
    print(f"\nFiles saved to: {SCREENSHOTS_DIR}")
    print("="*80)

if __name__ == "__main__":
    asyncio.run(main())