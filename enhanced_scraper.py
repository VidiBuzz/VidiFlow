#!/usr/bin/env python3
"""
Enhanced Kratom & Kava Business Scraper
Visits each Google Maps business listing to extract:
- Phone number
- Website URL
- Social media links
- Full address
"""

import asyncio
import json
import re
import os
from datetime import datetime
from playwright.async_api import async_playwright

OUTPUT_FILE = f"kratom_kava_complete_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

async def scrape_business_details(page, url, name):
    """Scrape detailed contact info from a Google Maps business page"""
    details = {
        'name': name,
        'google_maps_url': url,
        'phone': None,
        'website': None,
        'address': None,
        'rating': None,
        'reviews_count': None,
        'hours': None,
        'category': None,
        'plus_code': None,
        'social_links': []
    }
    
    try:
        print(f"  Scraping: {name}")
        await page.goto(url, timeout=30000)
        await page.wait_for_timeout(2000)  # Wait for page to load
        
        # Try to click on the business to expand details if needed
        try:
            # Look for and click "Website" button or link
            website_selectors = [
                'a[data-item-id="authority"]',
                'a[href*="http"]:has-text("Website")',
                'button:has-text("Website")',
                'a[aria-label*="Website"]',
                'div[data-item-id*="authority"] a',
            ]
            
            for selector in website_selectors:
                try:
                    element = await page.query_selector(selector)
                    if element:
                        href = await element.get_attribute('href')
                        if href and 'google.com' not in href and 'maps.google.com' not in href:
                            details['website'] = href
                            print(f"    Found website: {href}")
                            break
                except:
                    pass
            
            # Look for phone number
            phone_selectors = [
                'button[data-item-id*="phone"]',
                'button[aria-label*="Phone"]',
                'button:has-text("Phone")',
                'div[data-item-id*="phone"]',
                'span:has-text("Phone")',
            ]
            
            for selector in phone_selectors:
                try:
                    element = await page.query_selector(selector)
                    if element:
                        text = await element.inner_text()
                        # Extract phone number
                        phone_match = re.search(r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}', text)
                        if phone_match:
                            details['phone'] = phone_match.group()
                            print(f"    Found phone: {details['phone']}")
                            break
                        # Also check aria-label
                        aria = await element.get_attribute('aria-label')
                        if aria:
                            phone_match = re.search(r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}', aria)
                            if phone_match:
                                details['phone'] = phone_match.group()
                                print(f"    Found phone: {details['phone']}")
                                break
                except:
                    pass
            
            # Get all buttons with data-item-id which often contain contact info
            buttons = await page.query_selector_all('button[data-item-id]')
            for button in buttons:
                try:
                    item_id = await button.get_attribute('data-item-id')
                    aria_label = await button.get_attribute('aria-label')
                    inner_text = await button.inner_text()
                    
                    if item_id:
                        if 'phone' in item_id.lower() or 'tel' in item_id.lower():
                            # Extract phone from aria-label or inner_text
                            text = aria_label or inner_text
                            phone_match = re.search(r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}', text)
                            if phone_match:
                                details['phone'] = phone_match.group()
                                print(f"    Found phone: {details['phone']}")
                        
                        elif 'authority' in item_id.lower() or 'website' in item_id.lower():
                            # Website is usually in a link, check parent
                            parent = await button.evaluate_handle('el => el.parentElement')
                            if parent:
                                link = await parent.query_selector('a')
                                if link:
                                    href = await link.get_attribute('href')
                                    if href and 'google.com' not in href:
                                        details['website'] = href
                                        print(f"    Found website: {href}")
                except:
                    pass
            
            # Look for address
            address_selectors = [
                'button[data-item-id*="address"]',
                'button[aria-label*="Address"]',
                'div[data-item-id*="address"]',
            ]
            
            for selector in address_selectors:
                try:
                    element = await page.query_selector(selector)
                    if element:
                        aria = await element.get_attribute('aria-label')
                        if aria:
                            # Remove "Address: " prefix if present
                            address = re.sub(r'^Address:\s*', '', aria)
                            details['address'] = address
                            print(f"    Found address: {address[:50]}...")
                            break
                except:
                    pass
            
            # Get rating
            try:
                rating_element = await page.query_selector('div[role="img"][aria-label*="stars"]')
                if rating_element:
                    aria = await rating_element.get_attribute('aria-label')
                    if aria:
                        rating_match = re.search(r'(\d+\.?\d*)\s*stars?', aria)
                        if rating_match:
                            details['rating'] = rating_match.group(1)
                            print(f"    Found rating: {details['rating']}")
            except:
                pass
            
            # Get category/type
            try:
                category_element = await page.query_selector('button[jsaction*="category"]')
                if category_element:
                    details['category'] = await category_element.inner_text()
            except:
                pass
            
            # Look for social media links in the page
            social_patterns = [
                ('facebook.com', 'Facebook'),
                ('instagram.com', 'Instagram'),
                ('twitter.com', 'Twitter'),
                ('x.com', 'X/Twitter'),
                ('tiktok.com', 'TikTok'),
                ('youtube.com', 'YouTube'),
                ('yelp.com', 'Yelp'),
            ]
            
            links = await page.query_selector_all('a[href]')
            for link in links:
                try:
                    href = await link.get_attribute('href')
                    if href:
                        for pattern, social_name in social_patterns:
                            if pattern in href and 'share' not in href.lower():
                                if href not in [s['url'] for s in details['social_links']]:
                                    details['social_links'].append({
                                        'platform': social_name,
                                        'url': href
                                    })
                                    print(f"    Found {social_name}: {href}")
                except:
                    pass
            
        except Exception as e:
            print(f"    Error extracting details: {e}")
        
    except Exception as e:
        print(f"  Error loading page for {name}: {e}")
    
    return details

async def scrape_all_businesses():
    """Main function to scrape all businesses"""
    # Load existing data
    existing_file = "kratom_kava_comprehensive_20260213_133443.json"
    if not os.path.exists(existing_file):
        print(f"Error: {existing_file} not found")
        return
    
    with open(existing_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    all_businesses = []
    
    # Combine kava bars and kratom vendors
    for bar in data.get('kava_bars', []):
        if bar.get('link'):  # Has Google Maps link
            all_businesses.append({
                'type': 'kava_bar',
                'name': bar.get('name'),
                'url': bar.get('link'),
                'existing_data': bar
            })
    
    for vendor in data.get('kratom_vendors', []):
        if vendor.get('link'):  # Has Google Maps link
            all_businesses.append({
                'type': 'kratom_vendor',
                'name': vendor.get('name'),
                'url': vendor.get('link'),
                'existing_data': vendor
            })
    
    print(f"Found {len(all_businesses)} businesses to scrape")
    
    results = {
        'scraped_date': datetime.now().isoformat(),
        'kava_bars': [],
        'kratom_vendors': []
    }
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        for i, business in enumerate(all_businesses):
            print(f"\n[{i+1}/{len(all_businesses)}] Processing: {business['name']}")
            
            details = await scrape_business_details(page, business['url'], business['name'])
            
            # Merge with existing data
            merged = {
                **business['existing_data'],
                'phone': details.get('phone') or business['existing_data'].get('phone'),
                'website': details.get('website') or business['existing_data'].get('website'),
                'scraped_address': details.get('address'),
                'rating': details.get('rating') or business['existing_data'].get('rating'),
                'category': details.get('category'),
                'social_links': details.get('social_links', []),
                'google_maps_url': details.get('google_maps_url'),
                'scraped_successfully': bool(details.get('phone') or details.get('website'))
            }
            
            if business['type'] == 'kava_bar':
                results['kava_bars'].append(merged)
            else:
                results['kratom_vendors'].append(merged)
            
            # Save progress every 20 businesses
            if (i + 1) % 20 == 0:
                with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)
                print(f"\n  Progress saved to {OUTPUT_FILE}")
            
            # Small delay to avoid rate limiting
            await page.wait_for_timeout(1000)
        
        await browser.close()
    
    # Final save
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n\nScraping complete!")
    print(f"Results saved to: {OUTPUT_FILE}")
    
    # Print summary
    kava_with_phone = sum(1 for b in results['kava_bars'] if b.get('phone'))
    kava_with_website = sum(1 for b in results['kava_bars'] if b.get('website'))
    kratom_with_phone = sum(1 for b in results['kratom_vendors'] if b.get('phone'))
    kratom_with_website = sum(1 for b in results['kratom_vendors'] if b.get('website'))
    
    print(f"\nSummary:")
    print(f"  Kava Bars: {len(results['kava_bars'])} total")
    print(f"    - With phone: {kava_with_phone}")
    print(f"    - With website: {kava_with_website}")
    print(f"  Kratom Vendors: {len(results['kratom_vendors'])} total")
    print(f"    - With phone: {kratom_with_phone}")
    print(f"    - With website: {kratom_with_website}")

if __name__ == "__main__":
    asyncio.run(scrape_all_businesses())