#!/usr/bin/env python3
"""
Scrape descriptions from AI company websites
Extracts meta descriptions, about snippets, or first paragraph text
"""

import json
import asyncio
from playwright.async_api import async_playwright
from datetime import datetime
import re

# Load the JSON data
with open('ai_companies_v2_20260216_133614.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

businesses = data['businesses']

# Filter to only businesses with websites
companies_with_websites = [b for b in businesses if b.get('website')]
print(f"Found {len(companies_with_websites)} companies with websites")

async def scrape_description(page, url):
    """Scrape description from a website"""
    try:
        # Navigate with timeout
        await page.goto(url, timeout=15000, wait_until='domcontentloaded')
        
        # Wait a bit for dynamic content
        await page.wait_for_timeout(1000)
        
        # Try to get description in order of preference
        description = None
        
        # 1. Try meta description
        meta_desc = await page.query_selector('meta[name="description"]')
        if meta_desc:
            content = await meta_desc.get_attribute('content')
            if content and len(content) > 20:
                description = content.strip()
        
        # 2. Try og:description
        if not description:
            og_desc = await page.query_selector('meta[property="og:description"]')
            if og_desc:
                content = await og_desc.get_attribute('content')
                if content and len(content) > 20:
                    description = content.strip()
        
        # 3. Try hero section text
        if not description:
            hero_selectors = [
                'header + section h1 + p',
                'header + section p',
                '.hero p',
                '.hero-content p',
                '#hero p',
                '.banner p',
                'section:first-of-type p'
            ]
            for selector in hero_selectors:
                try:
                    elem = await page.query_selector(selector)
                    if elem:
                        text = await elem.inner_text()
                        if text and len(text) > 30:
                            description = text.strip()
                            break
                except:
                    pass
        
        # 4. Try about section
        if not description:
            about_selectors = [
                '#about p',
                '.about p',
                '[id*="about"] p',
                '[class*="about"] p'
            ]
            for selector in about_selectors:
                try:
                    elem = await page.query_selector(selector)
                    if elem:
                        text = await elem.inner_text()
                        if text and len(text) > 30:
                            description = text.strip()
                            break
                except:
                    pass
        
        # 5. Try first meaningful paragraph
        if not description:
            paragraphs = await page.query_selector_all('p')
            for p in paragraphs:
                try:
                    text = await p.inner_text()
                    # Skip short paragraphs, cookie notices, navigation text
                    if text and len(text) > 50 and 'cookie' not in text.lower():
                        if 'menu' not in text.lower() and 'navigation' not in text.lower():
                            description = text.strip()
                            break
                except:
                    pass
        
        # Clean up description
        if description:
            # Remove extra whitespace
            description = ' '.join(description.split())
            # Limit to ~300 characters
            if len(description) > 300:
                description = description[:297] + '...'
            return description
        
        return None
        
    except Exception as e:
        print(f"    Error: {str(e)[:50]}")
        return None

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        descriptions = {}
        total = len(companies_with_websites)
        
        for i, company in enumerate(companies_with_websites, 1):
            name = company.get('name', 'Unknown')
            url = company.get('website', '')
            
            if not url:
                continue
            
            print(f"[{i}/{total}] {name[:50]}...")
            
            try:
                desc = await scrape_description(page, url)
                if desc:
                    descriptions[name] = desc
                    print(f"    [OK] {desc[:80]}...")
                else:
                    print(f"    [--] No description found")
            except Exception as e:
                print(f"    [ERR] {str(e)[:50]}")
            
            # Save progress every 20 companies
            if i % 20 == 0:
                with open('company_descriptions.json', 'w', encoding='utf-8') as f:
                    json.dump(descriptions, f, indent=2, ensure_ascii=False)
                print(f"    [Progress saved: {len(descriptions)} descriptions]")
        
        await browser.close()
        
        # Final save
        with open('company_descriptions.json', 'w', encoding='utf-8') as f:
            json.dump(descriptions, f, indent=2, ensure_ascii=False)
        
        print(f"\nCompleted! Scraped {len(descriptions)} descriptions from {total} websites")
        return descriptions

if __name__ == "__main__":
    asyncio.run(main())
