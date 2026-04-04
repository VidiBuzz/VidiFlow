#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kratom Vendors and Kava/Kratom Tea Bars Scraper
Scrapes multiple sources to find kratom vendors and kava bars
Focus: South Florida and Nationwide
"""

import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from datetime import datetime
from urllib.parse import quote_plus, urljoin
import random

# User agents to rotate
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
]

def get_random_headers():
    return {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }

def make_request(url, retries=3):
    """Make HTTP request with retries and random delays"""
    for attempt in range(retries):
        try:
            time.sleep(random.uniform(1, 3))  # Random delay to be polite
            response = requests.get(url, headers=get_random_headers(), timeout=30)
            response.raise_for_status()
            return response
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed for {url}: {e}")
            if attempt < retries - 1:
                time.sleep(2)
    return None

def scrape_yelp_kava_bars(location="South Florida"):
    """Scrape Yelp for kava bars in specified location"""
    print(f"\n🍹 Scraping Yelp for kava bars in {location}...")
    
    businesses = []
    search_terms = ["kava bar", "kratom bar", "kava tea bar", "kratom tea"]
    
    for term in search_terms:
        print(f"  Searching: '{term}' in {location}")
        url = f"https://www.yelp.com/search?find_desc={quote_plus(term)}&find_loc={quote_plus(location)}"
        
        response = make_request(url)
        if not response:
            continue
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find business listings
        listings = soup.select('[class*="businessName"]')
        
        for listing in listings:
            try:
                name_elem = listing.select_one('a[href*="/biz/"]')
                if name_elem:
                    name = name_elem.get_text(strip=True)
                    link = 'https://www.yelp.com' + name_elem.get('href', '').split('?')[0]
                    
                    # Get parent container for more info
                    parent = listing.find_parent('div', class_=re.compile(r'container'))
                    if not parent:
                        parent = listing.find_parent('li')
                    
                    address = ""
                    phone = ""
                    rating = ""
                    
                    if parent:
                        # Try to extract address
                        addr_elem = parent.select_one('[class*="address"]')
                        if addr_elem:
                            address = addr_elem.get_text(strip=True)
                        
                        # Try to extract phone
                        phone_elem = parent.select_one('[class*="phone"]')
                        if phone_elem:
                            phone = phone_elem.get_text(strip=True)
                        
                        # Try to extract rating
                        rating_elem = parent.select_one('[class*="rating"]')
                        if rating_elem:
                            rating = rating_elem.get('aria-label', '') or rating_elem.get_text(strip=True)
                    
                    business = {
                        'name': name,
                        'type': 'kava_bar',
                        'address': address,
                        'phone': phone,
                        'rating': rating,
                        'source': 'yelp',
                        'search_term': term,
                        'link': link,
                        'location': location
                    }
                    
                    # Avoid duplicates
                    if not any(b['name'] == name and b['address'] == address for b in businesses):
                        businesses.append(business)
                        print(f"    Found: {name}")
                        
            except Exception as e:
                continue
        
        time.sleep(2)  # Be polite between searches
    
    return businesses

def scrape_yellow_pages(search_term="kratom", location="South Florida"):
    """Scrape Yellow Pages for businesses"""
    print(f"\n📖 Scraping Yellow Pages for '{search_term}' in {location}...")
    
    businesses = []
    url = f"https://www.yellowpages.com/search?search_terms={quote_plus(search_term)}&geo_location_terms={quote_plus(location)}"
    
    response = make_request(url)
    if not response:
        return businesses
        
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find business listings
    listings = soup.select('.result')
    
    for listing in listings:
        try:
            name_elem = listing.select_one('.business-name')
            if name_elem:
                name = name_elem.get_text(strip=True)
                link = name_elem.get('href', '')
                if link and not link.startswith('http'):
                    link = 'https://www.yellowpages.com' + link
                
                address_elem = listing.select_one('.street-address')
                address = address_elem.get_text(strip=True) if address_elem else ""
                
                locality_elem = listing.select_one('.locality')
                locality = locality_elem.get_text(strip=True) if locality_elem else ""
                
                phone_elem = listing.select_one('.phones')
                phone = phone_elem.get_text(strip=True) if phone_elem else ""
                
                categories_elem = listing.select_one('.categories')
                categories = categories_elem.get_text(strip=True) if categories_elem else ""
                
                business = {
                    'name': name,
                    'type': 'vendor' if 'vendor' in categories.lower() or 'store' in categories.lower() else 'business',
                    'address': f"{address}, {locality}",
                    'phone': phone,
                    'categories': categories,
                    'source': 'yellow_pages',
                    'link': link,
                    'location': location
                }
                
                businesses.append(business)
                print(f"    Found: {name}")
                
        except Exception as e:
            continue
    
    return businesses

def scrape_kratom_directory():
    """Scrape kratom vendor directories"""
    print(f"\n🌿 Scraping kratom vendor directories...")
    
    vendors = []
    
    # Known kratom directory websites
    directories = [
        {
            'name': 'Kratom Directory',
            'url': 'https://www.wekratom.com/kratom-vendors/',
            'parser': 'generic'
        },
        {
            'name': 'Kratom.org Vendors',
            'url': 'https://kratom.org/vendors/',
            'parser': 'generic'
        }
    ]
    
    for directory in directories:
        print(f"  Checking: {directory['name']}")
        response = make_request(directory['url'])
        
        if not response:
            print(f"    Could not access {directory['name']}")
            continue
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all links that might be vendor links
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            # Look for vendor-related links
            if any(keyword in text.lower() for keyword in ['kratom', 'kava', 'botanical', 'tea', 'vendor', 'shop', 'store']):
                if text and len(text) > 2 and len(text) < 100:
                    vendor = {
                        'name': text,
                        'type': 'kratom_vendor',
                        'link': href if href.startswith('http') else urljoin(directory['url'], href),
                        'source': directory['name'],
                        'location': 'Online/Nationwide'
                    }
                    
                    if not any(v['name'] == text for v in vendors):
                        vendors.append(vendor)
                        print(f"    Found: {text}")
        
        time.sleep(2)
    
    return vendors

def scrape_google_maps_playwright(location="South Florida"):
    """
    Use Playwright to scrape Google Maps (requires playwright install)
    This is more robust but requires: pip install playwright && playwright install
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("\n⚠️ Playwright not installed. Skipping Google Maps scrape.")
        print("  To enable: pip install playwright && playwright install chromium")
        return []
    
    print(f"\n🗺️ Scraping Google Maps for kava/kratom bars in {location}...")
    
    businesses = []
    search_terms = ["kava bar", "kratom bar", "kratom shop", "kava tea house"]
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()
        
        for term in search_terms:
            print(f"  Searching: '{term}'")
            search_url = f"https://www.google.com/maps/search/{quote_plus(term + ' ' + location)}"
            
            try:
                page.goto(search_url, timeout=30000)
                time.sleep(3)  # Wait for results to load
                
                # Scroll to load more results
                for _ in range(3):
                    page.evaluate("document.querySelector('[role=\"feed\"]')?.scrollBy(0, 1000)")
                    time.sleep(1)
                
                # Extract business info
                listings = page.query_selector_all('[data-item-id]')
                
                for listing in listings[:20]:  # Limit to first 20
                    try:
                        name_elem = listing.query_selector('h3, [class*="fontHeadline"]')
                        name = name_elem.inner_text() if name_elem else ""
                        
                        if name:
                            # Click to get more details
                            link = listing.query_selector('a[href*="maps/place"]')
                            href = link.get_attribute('href') if link else ""
                            
                            # Get address and other info from aria-label or nearby elements
                            aria_label = listing.get_attribute('aria-label') or ""
                            
                            business = {
                                'name': name,
                                'type': 'kava_bar',
                                'details': aria_label,
                                'source': 'google_maps',
                                'link': href,
                                'search_term': term,
                                'location': location
                            }
                            
                            if not any(b['name'] == name for b in businesses):
                                businesses.append(business)
                                print(f"    Found: {name}")
                                
                    except Exception as e:
                        continue
                        
            except Exception as e:
                print(f"    Error: {e}")
                
            time.sleep(2)
        
        browser.close()
    
    return businesses

def scrape_reddit_kratom():
    """Scrape Reddit for kratom vendor recommendations"""
    print(f"\n💬 Scraping Reddit for kratom vendor discussions...")
    
    vendors = []
    
    # Reddit search URLs (old.reddit is easier to scrape)
    subreddits = ['kratom', 'quittingkratom', 'kratomkorner']
    search_terms = ['vendor list', 'best vendor', 'reliable vendor', 'trusted vendor']
    
    for subreddit in subreddits:
        for term in search_terms:
            url = f"https://old.reddit.com/r/{subreddit}/search?q={quote_plus(term)}&restrict_sr=on&sort=relevance&t=all"
            
            response = make_request(url)
            if not response:
                continue
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find post links
            for post in soup.select('.search-result-link'):
                try:
                    title_elem = post.select_one('a.search-title')
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        link = title_elem.get('href', '')
                        
                        # Look for vendor names in title
                        if any(kw in title.lower() for kw in ['vendor', 'list', 'recommend', 'best']):
                            vendors.append({
                                'name': title,
                                'type': 'reddit_discussion',
                                'link': link,
                                'source': f'reddit/r/{subreddit}',
                                'search_term': term
                            })
                            print(f"    Found discussion: {title[:50]}...")
                            
                except Exception as e:
                    continue
            
            time.sleep(2)
    
    return vendors

def compile_known_vendors():
    """Add known kratom vendors from public knowledge"""
    print(f"\n📋 Compiling known kratom vendors...")
    
    known_vendors = [
        # Major online kratom vendors
        {"name": "Kraken Kratom", "type": "online_vendor", "website": "https://krakenkratom.com", "location": "Online"},
        {"name": "Coastline Kratom", "type": "online_vendor", "website": "https://coastlinekratom.com", "location": "Online"},
        {"name": "PurKratom", "type": "online_vendor", "website": "https://purkratom.com", "location": "Online"},
        {"name": "Kats Botanicals", "type": "online_vendor", "website": "https://katsbotanicals.com", "location": "Online"},
        {"name": "Happy Hippo Herbals", "type": "online_vendor", "website": "https://happyhippoherbals.com", "location": "Online"},
        {"name": "Phytoextractum", "type": "online_vendor", "website": "https://phytoextractum.com", "location": "Online"},
        {"name": "Left Coast Kratom", "type": "online_vendor", "website": "https://leftcoastkratom.com", "location": "Online"},
        {"name": "Remarkable Herbs", "type": "online_vendor", "website": "https://remarkableherbs.com", "location": "Online"},
        {"name": "Super Speciosa", "type": "online_vendor", "website": "https://superspeciosa.com", "location": "Online"},
        {"name": "OPMS Kratom", "type": "brand", "website": "https://opmskratom.com", "location": "Nationwide"},
        {"name": "MIT45", "type": "brand", "website": "https://mit45.com", "location": "Nationwide"},
        {"name": "Hush Kratom", "type": "brand", "website": "https://hushkratom.com", "location": "Nationwide"},
        
        # Known kava bar chains/locations in South Florida
        {"name": "Kava Culture", "type": "kava_bar", "location": "South Florida", "website": "https://kavaculture.com"},
        {"name": "Kavasutra", "type": "kava_bar", "location": "South Florida", "website": "https://kavasutra.com"},
        {"name": "Noble Kava", "type": "kava_bar", "location": "Florida", "website": "https://noblekava.com"},
        {"name": "Bula Kava House", "type": "kava_bar", "location": "Florida", "website": "https://bulakavahouse.com"},
        {"name": "Kava Konnection", "type": "kava_bar", "location": "Florida"},
        {"name": "Grateful Kratom", "type": "kava_bar", "location": "Florida"},
        {"name": "The Kava Lounge", "type": "kava_bar", "location": "South Florida"},
        {"name": "Kava Bar Fort Lauderdale", "type": "kava_bar", "location": "Fort Lauderdale, FL"},
        {"name": "Kava Bar Miami", "type": "kava_bar", "location": "Miami, FL"},
        {"name": "Palm Beach Kava", "type": "kava_bar", "location": "Palm Beach, FL"},
    ]
    
    for vendor in known_vendors:
        vendor['source'] = 'known_database'
        print(f"    Added: {vendor['name']}")
    
    return known_vendors

def main():
    """Main function to run all scrapers"""
    print("=" * 60)
    print("🌿 KRATOM & KAVA BUSINESS SCRAPER")
    print("=" * 60)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    all_results = {
        'kava_bars': [],
        'kratom_vendors': [],
        'discussions': [],
        'metadata': {
            'scraped_at': datetime.now().isoformat(),
            'locations_searched': ['South Florida', 'Florida', 'Miami', 'Fort Lauderdale', 'West Palm Beach']
        }
    }
    
    # 1. Compile known vendors first
    known = compile_known_vendors()
    for item in known:
        if item.get('type') == 'kava_bar':
            all_results['kava_bars'].append(item)
        else:
            all_results['kratom_vendors'].append(item)
    
    # 2. Scrape Yelp for kava bars
    for location in ['South Florida', 'Miami, FL', 'Fort Lauderdale, FL', 'West Palm Beach, FL']:
        yelp_results = scrape_yelp_kava_bars(location)
        for item in yelp_results:
            if not any(b['name'] == item['name'] for b in all_results['kava_bars']):
                all_results['kava_bars'].append(item)
    
    # 3. Scrape Yellow Pages
    for term in ['kratom', 'kava bar', 'kava tea']:
        for location in ['South Florida', 'Miami, FL', 'Fort Lauderdale, FL']:
            yp_results = scrape_yellow_pages(term, location)
            for item in yp_results:
                if 'kava' in item.get('categories', '').lower() or 'bar' in item.get('categories', '').lower():
                    if not any(b['name'] == item['name'] for b in all_results['kava_bars']):
                        all_results['kava_bars'].append(item)
                else:
                    if not any(b['name'] == item['name'] for b in all_results['kratom_vendors']):
                        all_results['kratom_vendors'].append(item)
    
    # 4. Scrape kratom directories
    dir_results = scrape_kratom_directory()
    for item in dir_results:
        if not any(b['name'] == item['name'] for b in all_results['kratom_vendors']):
            all_results['kratom_vendors'].append(item)
    
    # 5. Try Google Maps with Playwright (if available)
    try:
        gmaps_results = scrape_google_maps_playwright("South Florida")
        for item in gmaps_results:
            if not any(b['name'] == item['name'] for b in all_results['kava_bars']):
                all_results['kava_bars'].append(item)
    except Exception as e:
        print(f"\n⚠️ Google Maps scraping skipped: {e}")
    
    # 6. Scrape Reddit for discussions
    reddit_results = scrape_reddit_kratom()
    all_results['discussions'] = reddit_results
    
    # Save results
    output_file = f'kratom_kava_results_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    
    # Also save as readable text
    text_file = output_file.replace('.json', '.txt')
    with open(text_file, 'w', encoding='utf-8') as f:
        f.write("=" * 60 + "\n")
        f.write("KRATOM VENDORS & KAVA BARS - SCRAPING RESULTS\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("-" * 60 + "\n")
        f.write(f"🍹 KAVA/KRATOM BARS ({len(all_results['kava_bars'])} found)\n")
        f.write("-" * 60 + "\n\n")
        
        for bar in all_results['kava_bars']:
            f.write(f"Name: {bar.get('name', 'N/A')}\n")
            f.write(f"Location: {bar.get('location', bar.get('address', 'N/A'))}\n")
            if bar.get('phone'):
                f.write(f"Phone: {bar['phone']}\n")
            if bar.get('link') or bar.get('website'):
                f.write(f"Website: {bar.get('link') or bar.get('website')}\n")
            f.write(f"Source: {bar.get('source', 'N/A')}\n")
            f.write("\n")
        
        f.write("-" * 60 + "\n")
        f.write(f"🌿 KRATOM VENDORS ({len(all_results['kratom_vendors'])} found)\n")
        f.write("-" * 60 + "\n\n")
        
        for vendor in all_results['kratom_vendors']:
            f.write(f"Name: {vendor.get('name', 'N/A')}\n")
            f.write(f"Type: {vendor.get('type', 'N/A')}\n")
            f.write(f"Location: {vendor.get('location', 'N/A')}\n")
            if vendor.get('link') or vendor.get('website'):
                f.write(f"Website: {vendor.get('link') or vendor.get('website')}\n")
            f.write(f"Source: {vendor.get('source', 'N/A')}\n")
            f.write("\n")
        
        f.write("-" * 60 + "\n")
        f.write(f"💬 REDDIT DISCUSSIONS ({len(all_results['discussions'])} found)\n")
        f.write("-" * 60 + "\n\n")
        
        for disc in all_results['discussions'][:20]:  # Limit to 20
            f.write(f"Title: {disc.get('name', 'N/A')}\n")
            f.write(f"Link: {disc.get('link', 'N/A')}\n")
            f.write("\n")
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 SCRAPING COMPLETE!")
    print("=" * 60)
    print(f"Kava/Kratom Bars Found: {len(all_results['kava_bars'])}")
    print(f"Kratom Vendors Found: {len(all_results['kratom_vendors'])}")
    print(f"Reddit Discussions Found: {len(all_results['discussions'])}")
    print(f"\nResults saved to:")
    print(f"  - {output_file} (JSON)")
    print(f"  - {text_file} (Text)")
    print("=" * 60)
    
    return all_results

if __name__ == "__main__":
    main()
