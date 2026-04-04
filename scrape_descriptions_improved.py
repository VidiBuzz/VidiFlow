#!/usr/bin/env python3
"""
Improved description scraper with better error handling
Retries failed sites and uses multiple extraction methods
"""

import json
import asyncio
from playwright.async_api import async_playwright
from datetime import datetime
import re

# Load the JSON data
with open('ai_companies_v2_20260216_133614.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Load existing descriptions
try:
    with open('company_descriptions.json', 'r', encoding='utf-8') as f:
        descriptions = json.load(f)
    print(f"Loaded {len(descriptions)} existing descriptions")
except:
    descriptions = {}
    print("No existing descriptions found")

businesses = data['businesses']

# Find companies without descriptions that have websites
companies_to_scrape = []
for b in businesses:
    name = b.get('name', '')
    website = b.get('website', '')
    if website and name not in descriptions:
        companies_to_scrape.append(b)

print(f"Found {len(companies_to_scrape)} companies to scrape (missing descriptions)")

async def scrape_description(page, url, name):
    """Scrape description with multiple fallback methods"""
    try:
        # Navigate with longer timeout
        await page.goto(url, timeout=30000, wait_until='networkidle')
        
        # Wait for page to be ready
        await page.wait_for_timeout(2000)
        
        description = None
        
        # Method 1: Meta description
        try:
            meta_desc = await page.query_selector('meta[name="description"]')
            if meta_desc:
                content = await meta_desc.get_attribute('content')
                if content and len(content.strip()) > 20:
                    description = content.strip()
        except:
            pass
        
        # Method 2: OG description
        if not description:
            try:
                og_desc = await page.query_selector('meta[property="og:description"]')
                if og_desc:
                    content = await og_desc.get_attribute('content')
                    if content and len(content.strip()) > 20:
                        description = content.strip()
            except:
                pass
        
        # Method 3: Twitter description
        if not description:
            try:
                tw_desc = await page.query_selector('meta[name="twitter:description"]')
                if tw_desc:
                    content = await tw_desc.get_attribute('content')
                    if content and len(content.strip()) > 20:
                        description = content.strip()
            except:
                pass
        
        # Method 4: Hero section / banner text
        if not description:
            selectors = [
                'header + section h1 + p',
                'header + section p',
                '.hero p',
                '.hero-content p',
                '.banner p',
                '#hero p',
                'section:first-of-type p',
                '.intro p',
                '.tagline',
                'h1 + p',
                'h2 + p'
            ]
            for selector in selectors:
                try:
                    elem = await page.query_selector(selector)
                    if elem:
                        text = await elem.inner_text()
                        if text and len(text.strip()) > 30:
                            description = text.strip()
                            break
                except:
                    pass
        
        # Method 5: About section
        if not description:
            about_selectors = [
                '#about p',
                '.about p',
                '[id*="about"] p',
                '[class*="about"] p',
                '#about-us p',
                '.about-us p'
            ]
            for selector in about_selectors:
                try:
                    elem = await page.query_selector(selector)
                    if elem:
                        text = await elem.inner_text()
                        if text and len(text.strip()) > 30:
                            description = text.strip()
                            break
                except:
                    pass
        
        # Method 6: First meaningful paragraph
        if not description:
            try:
                paragraphs = await page.query_selector_all('p')
                for p in paragraphs:
                    text = await p.inner_text()
                    # Skip short paragraphs, cookie notices, navigation
                    skip_words = ['cookie', 'menu', 'navigation', 'subscribe', 'newsletter', 
                                  'copyright', 'all rights reserved', 'privacy policy']
                    if text and len(text.strip()) > 50:
                        text_lower = text.lower()
                        if not any(word in text_lower for word in skip_words):
                            description = text.strip()
                            break
            except:
                pass
        
        # Method 7: Get visible text from body (last resort)
        if not description:
            try:
                body = await page.query_selector('body')
                if body:
                    text = await body.inner_text()
                    lines = [l.strip() for l in text.split('\n') if l.strip()]
                    # Find first substantial line
                    for line in lines:
                        if len(line) > 50 and not line.startswith('Menu') and not line.startswith('Skip'):
                            description = line[:300]
                            break
            except:
                pass
        
        # Clean up description
        if description:
            # Remove extra whitespace
            description = ' '.join(description.split())
            # Limit length
            if len(description) > 300:
                description = description[:297] + '...'
            return description
        
        return None
        
    except Exception as e:
        error_msg = str(e)
        if 'Timeout' in error_msg:
            print(f"    [TIMEOUT] Page took too long to load")
        elif 'SSL' in error_msg or 'CERT' in error_msg:
            print(f"    [SSL] Certificate error")
        elif 'ERR_NAME_NOT_RESOLVED' in error_msg:
            print(f"    [DNS] Domain not found")
        elif 'ERR_CONNECTION' in error_msg:
            print(f"    [CONN] Connection failed")
        elif 'Navigation' in error_msg:
            print(f"    [NAV] Navigation blocked")
        else:
            print(f"    [ERR] {error_msg[:60]}")
        return None

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ignore_https_errors=True  # Ignore SSL errors
        )
        page = await context.new_page()
        
        total = len(companies_to_scrape)
        new_descriptions = 0
        
        for i, company in enumerate(companies_to_scrape, 1):
            name = company.get('name', 'Unknown')
            url = company.get('website', '')
            
            if not url:
                continue
            
            print(f"[{i}/{total}] {name[:50]}...")
            
            try:
                desc = await scrape_description(page, url, name)
                if desc:
                    descriptions[name] = desc
                    new_descriptions += 1
                    print(f"    [OK] {desc[:80]}...")
                else:
                    print(f"    [--] No description found")
            except Exception as e:
                print(f"    [ERR] {str(e)[:60]}")
            
            # Save progress every 25 companies
            if i % 25 == 0:
                with open('company_descriptions.json', 'w', encoding='utf-8') as f:
                    json.dump(descriptions, f, indent=2, ensure_ascii=False)
                print(f"    [Saved: {len(descriptions)} total descriptions, {new_descriptions} new]")
        
        await browser.close()
        
        # Final save
        with open('company_descriptions.json', 'w', encoding='utf-8') as f:
            json.dump(descriptions, f, indent=2, ensure_ascii=False)
        
        print(f"\nCompleted! Total descriptions: {len(descriptions)} ({new_descriptions} new)")
        return descriptions

if __name__ == "__main__":
    asyncio.run(main())
