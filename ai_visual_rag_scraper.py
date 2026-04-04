#!/usr/bin/env python3
"""
AI & Visual AI Consulting Company Scraper
Searches for companies specializing in:
- AI Consulting
- Visual AI / Computer Vision
- RAG (Retrieval Augmented Generation) 
- Video Commerce / Content Generation
- On-premise / Private AI solutions
- Open Source AI implementations

Target Cities:
1. South Florida (Miami, Fort Lauderdale, West Palm Beach)
2. Cleveland, OH
3. Denver, CO
4. San Francisco, CA
5. Detroit, MI
6. Chicago, IL
7. Saint Louis, MO
8. Bentonville, AR
"""

import asyncio
import json
import re
import os
from datetime import datetime
from playwright.async_api import async_playwright

OUTPUT_FILE = f"ai_visual_rag_companies_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

# Search queries for different company types
SEARCH_QUERIES = {
    "ai_consulting": [
        "AI consulting company",
        "artificial intelligence consulting firm",
        "AI strategy consulting",
        "machine learning consulting services",
        "AI implementation consulting",
    ],
    "visual_ai": [
        "visual AI company",
        "computer vision consulting",
        "image recognition AI services",
        "video AI analysis company",
        "visual machine learning consulting",
        "AI video generation company",
        "automated video content creation AI",
    ],
    "rag_workflows": [
        "RAG consulting retrieval augmented generation",
        "vector database consulting",
        "AI workflow automation consulting",
        "LLM implementation services",
        "enterprise AI search solutions",
        "semantic search AI consulting",
    ],
    "on_premise_ai": [
        "on-premise AI solutions",
        "private AI deployment consulting",
        "local AI server setup",
        "open source AI consulting",
        "self-hosted AI solutions",
        "in-house AI implementation",
        "AI infrastructure consulting",
    ],
    "video_commerce": [
        "AI video commerce solutions",
        "automated content generation AI",
        "AI product video creation",
        "video automation AI services",
        "AI content generation platform",
    ],
}

# Target locations
LOCATIONS = [
    {"name": "South Florida", "cities": ["Miami FL", "Fort Lauderdale FL", "West Palm Beach FL", "Boca Raton FL", "Hollywood FL"]},
    {"name": "Cleveland OH", "cities": ["Cleveland OH"]},
    {"name": "Denver CO", "cities": ["Denver CO", "Boulder CO"]},
    {"name": "San Francisco CA", "cities": ["San Francisco CA", "San Jose CA", "Palo Alto CA", "Mountain View CA", "Sunnyvale CA"]},
    {"name": "Detroit MI", "cities": ["Detroit MI", "Ann Arbor MI"]},
    {"name": "Chicago IL", "cities": ["Chicago IL"]},
    {"name": "Saint Louis MO", "cities": ["Saint Louis MO"]},
    {"name": "Bentonville AR", "cities": ["Bentonville AR", "Fayetteville AR"]},
]

async def scrape_google_maps(page, query, location):
    """Scrape Google Maps for businesses matching query in location"""
    businesses = []
    
    search_term = f"{query} {location}"
    url = f"https://www.google.com/maps/search/{search_term.replace(' ', '+')}"
    
    try:
        print(f"  Searching: {search_term}")
        await page.goto(url, timeout=30000)
        await page.wait_for_timeout(3000)
        
        # Scroll to load more results
        for _ in range(3):
            await page.evaluate('document.querySelector("#QA0Szd")?.scrollTo(0, document.body.scrollHeight)')
            await page.wait_for_timeout(2000)
        
        # Get all business listings
        listings = await page.query_selector_all('div.Nv2PK')
        
        for listing in listings[:20]:  # Limit to top 20 per search
            try:
                # Get business name
                name_el = await listing.query_selector('div.qBF1Pd')
                name = await name_el.inner_text() if name_el else "Unknown"
                
                # Get link to business page
                link_el = await listing.query_selector('a.hfpxzc')
                link = await link_el.get_attribute('href') if link_el else None
                
                # Get address/rating info
                address_el = await listing.query_selector('div.W4Efsd')
                address_text = await address_el.inner_text() if address_el else ""
                
                # Extract rating
                rating = None
                rating_match = re.search(r'(\d+\.?\d*)\s*stars?', address_text)
                if rating_match:
                    rating = rating_match.group(1)
                
                # Extract phone from address text
                phone = None
                phone_match = re.search(r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}', address_text)
                if phone_match:
                    phone = phone_match.group()
                
                if name and link:
                    businesses.append({
                        'name': name,
                        'link': link,
                        'address': address_text,
                        'rating': rating,
                        'phone': phone,
                        'search_query': query,
                        'location': location,
                    })
            except Exception as e:
                continue
        
        print(f"    Found {len(businesses)} businesses")
        
    except Exception as e:
        print(f"    Error searching {search_term}: {e}")
    
    return businesses

async def scrape_business_details(page, url, name):
    """Scrape detailed contact info from a Google Maps business page"""
    details = {
        'name': name,
        'google_maps_url': url,
        'phone': None,
        'website': None,
        'address': None,
        'rating': None,
        'category': None,
        'social_links': []
    }
    
    try:
        await page.goto(url, timeout=30000)
        await page.wait_for_timeout(2000)
        
        # Get website
        website_selectors = [
            'a[data-item-id="authority"]',
            'a[href*="http"]:has-text("Website")',
            'button:has-text("Website")',
        ]
        
        for selector in website_selectors:
            try:
                element = await page.query_selector(selector)
                if element:
                    href = await element.get_attribute('href')
                    if href and 'google.com' not in href:
                        details['website'] = href
                        break
            except:
                pass
        
        # Get phone
        buttons = await page.query_selector_all('button[data-item-id]')
        for button in buttons:
            try:
                item_id = await button.get_attribute('data-item-id')
                aria_label = await button.get_attribute('aria-label')
                
                if item_id and 'phone' in item_id.lower():
                    text = aria_label or await button.inner_text()
                    phone_match = re.search(r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}', text)
                    if phone_match:
                        details['phone'] = phone_match.group()
            except:
                pass
        
        # Get address
        try:
            address_el = await page.query_selector('button[data-item-id*="address"]')
            if address_el:
                aria = await address_el.get_attribute('aria-label')
                if aria:
                    details['address'] = re.sub(r'^Address:\s*', '', aria)
        except:
            pass
        
        # Get category
        try:
            category_el = await page.query_selector('button[jsaction*="category"]')
            if category_el:
                details['category'] = await category_el.inner_text()
        except:
            pass
        
        # Get rating
        try:
            rating_el = await page.query_selector('div[role="img"][aria-label*="stars"]')
            if rating_el:
                aria = await rating_el.get_attribute('aria-label')
                if aria:
                    rating_match = re.search(r'(\d+\.?\d*)\s*stars?', aria)
                    if rating_match:
                        details['rating'] = rating_match.group(1)
        except:
            pass
        
        # Get social links
        social_patterns = [
            ('linkedin.com', 'LinkedIn'),
            ('github.com', 'GitHub'),
            ('twitter.com', 'Twitter'),
            ('x.com', 'X/Twitter'),
            ('facebook.com', 'Facebook'),
            ('instagram.com', 'Instagram'),
            ('youtube.com', 'YouTube'),
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
            except:
                pass
        
        print(f"    Scraped: {name} - Website: {details['website']}, Phone: {details['phone']}")
        
    except Exception as e:
        print(f"    Error scraping {name}: {e}")
    
    return details

async def main():
    """Main scraping function"""
    all_businesses = []
    seen_names = set()  # Track unique businesses
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        # Phase 1: Search for businesses
        print("\n" + "="*80)
        print("PHASE 1: Searching for AI & Visual AI Consulting Companies")
        print("="*80)
        
        for location_group in LOCATIONS:
            region = location_group['name']
            print(f"\n--- Region: {region} ---")
            
            for city in location_group['cities']:
                print(f"\nCity: {city}")
                
                for category, queries in SEARCH_QUERIES.items():
                    print(f"\n  Category: {category}")
                    
                    for query in queries[:2]:  # Limit to 2 queries per category per city
                        businesses = await scrape_google_maps(page, query, city)
                        
                        for b in businesses:
                            # Deduplicate by name
                            key = f"{b['name']}_{city}".lower()
                            if key not in seen_names:
                                seen_names.add(key)
                                b['region'] = region
                                b['category'] = category
                                all_businesses.append(b)
                        
                        await page.wait_for_timeout(1000)  # Rate limiting
        
        # Phase 2: Get detailed contact info
        print("\n" + "="*80)
        print("PHASE 2: Scraping detailed contact information")
        print("="*80)
        
        for i, business in enumerate(all_businesses):
            print(f"\n[{i+1}/{len(all_businesses)}] {business['name']}")
            
            if business.get('link'):
                details = await scrape_business_details(page, business['link'], business['name'])
                
                # Merge details
                business['phone'] = details.get('phone') or business.get('phone')
                business['website'] = details.get('website')
                business['scraped_address'] = details.get('address')
                business['category'] = details.get('category') or business.get('category')
                business['rating'] = details.get('rating') or business.get('rating')
                business['social_links'] = details.get('social_links', [])
                business['scraped_successfully'] = bool(details.get('phone') or details.get('website'))
            
            # Save progress every 20 businesses
            if (i + 1) % 20 == 0:
                with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                    json.dump({
                        'scraped_date': datetime.now().isoformat(),
                        'total_businesses': len(all_businesses),
                        'businesses': all_businesses
                    }, f, indent=2, ensure_ascii=False)
                print(f"\n  Progress saved to {OUTPUT_FILE}")
            
            await page.wait_for_timeout(1000)  # Rate limiting
        
        await browser.close()
    
    # Final save
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump({
            'scraped_date': datetime.now().isoformat(),
            'total_businesses': len(all_businesses),
            'businesses': all_businesses
        }, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "="*80)
    print("SCRAPING COMPLETE!")
    print("="*80)
    print(f"Total businesses found: {len(all_businesses)}")
    print(f"Results saved to: {OUTPUT_FILE}")
    
    # Stats by region
    print("\nBy Region:")
    for location_group in LOCATIONS:
        region = location_group['name']
        count = sum(1 for b in all_businesses if b.get('region') == region)
        print(f"  {region}: {count}")
    
    # Stats by category
    print("\nBy Category:")
    for category in SEARCH_QUERIES.keys():
        count = sum(1 for b in all_businesses if b.get('category') == category)
        print(f"  {category}: {count}")
    
    # Contact info stats
    with_phone = sum(1 for b in all_businesses if b.get('phone'))
    with_website = sum(1 for b in all_businesses if b.get('website'))
    print(f"\nWith Phone Numbers: {with_phone}")
    print(f"With Websites: {with_website}")

if __name__ == "__main__":
    asyncio.run(main())