#!/usr/bin/env python3
"""
Fetch VLM Model Comparison page and extract its content.
"""

import asyncio
from playwright.async_api import async_playwright

async def main():
    print("Fetching VLM Model Comparison page...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        try:
            await page.goto('https://vidismart.com/VLM_Model_Comparison_2026.html', wait_until='networkidle', timeout=60000)
            await asyncio.sleep(2)
            
            # Get the full HTML content
            html_content = await page.content()
            
            # Save the HTML to a file
            with open('VLM_Model_Comparison_2026.html', 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            print(f"[OK] Page saved: VLM_Model_Comparison_2026.html")
            print(f"[INFO] Page title: {await page.title()}")
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch page: {str(e)}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())