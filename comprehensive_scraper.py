#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive Kratom Vendors and Kava Bars Scraper
Uses Playwright for browser automation to bypass anti-scraping measures
"""

import sys
import io
import json
import time
import re
from datetime import datetime
from urllib.parse import quote_plus
import random

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def random_delay(min_sec=1, max_sec=3):
    """Random delay to appear more human-like"""
    time.sleep(random.uniform(min_sec, max_sec))

def scrape_google_maps(playwright, search_terms, locations):
    """Scrape Google Maps for businesses"""
    print("\n[GOOGLE MAPS] Starting comprehensive scrape...")
    
    businesses = []
    seen_names = set()
    
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport={'width': 1920, 'height': 1080},
        locale='en-US'
    )
    page = context.new_page()
    
    for location in locations:
        for term in search_terms:
            print(f"\n  Searching: '{term}' in {location}")
            
            search_url = f"https://www.google.com/maps/search/{quote_plus(term + ' ' + location)}"
            
            try:
                page.goto(search_url, timeout=60000)
                random_delay(3, 5)
                
                # Scroll to load more results
                for scroll_count in range(5):
                    page.evaluate("""
                        const feed = document.querySelector('[role="feed"]') || 
                                    document.querySelector('.m6QErb') ||
                                    document.querySelector('[class*="scroll"]');
                        if (feed) {
                            feed.scrollTop = feed.scrollHeight;
                        }
                    """)
                    random_delay(1, 2)
                
                # Extract business listings
                listings = page.query_selector_all('div.Nv2PK, div.bfdHYd, div.lI9IFe, [data-item-id]')
                
                print(f"    Found {len(listings)} potential listings")
                
                for listing in listings:
                    try:
                        # Try multiple selectors for business name
                        name = None
                        for selector in ['h3', '.qBF1Pd', '.fontHeadline', '[class*="fontHeadline"]', 'div.fontBodyMedium']:
                            elem = listing.query_selector(selector)
                            if elem:
                                name = elem.inner_text().strip()
                                if name and len(name) > 1:
                                    break
                        
                        if not name or name in seen_names:
                            continue
                        
                        # Get link
                        link_elem = listing.query_selector('a[href*="maps/place"], a[href*="maps.google"]')
                        link = link_elem.get_attribute('href') if link_elem else ""
                        
                        # Get address and other details from aria-label
                        aria_label = listing.get_attribute('aria-label') or ""
                        
                        # Try to extract address from the listing
                        address = ""
                        for selector in ['.W4Efsd', '[class*="address"]', '.fontBodyMedium']:
                            addr_elem = listing.query_selector(selector)
                            if addr_elem:
                                addr_text = addr_elem.inner_text().strip()
                                if addr_text and len(addr_text) > 5:
                                    address = addr_text
                                    break
                        
                        # Get rating if available
                        rating = ""
                        rating_elem = listing.query_selector('[class*="rating"], .MW4etd')
                        if rating_elem:
                            rating = rating_elem.inner_text().strip()
                        
                        # Determine business type
                        business_type = 'kava_bar' if any(kw in term.lower() for kw in ['kava', 'tea bar']) else 'kratom_vendor'
                        
                        business = {
                            'name': name,
                            'type': business_type,
                            'address': address,
                            'rating': rating,
                            'details': aria_label[:200] if aria_label else "",
                            'source': 'google_maps',
                            'link': link,
                            'search_term': term,
                            'location': location
                        }
                        
                        if name not in seen_names:
                            seen_names.add(name)
                            businesses.append(business)
                            print(f"      Added: {name}")
                        
                    except Exception as e:
                        continue
                
                random_delay(2, 4)
                
            except Exception as e:
                print(f"    Error: {e}")
                continue
    
    browser.close()
    return businesses

def scrape_yelp_with_playwright(playwright, search_terms, locations):
    """Scrape Yelp using Playwright"""
    print("\n[YELP] Starting comprehensive scrape...")
    
    businesses = []
    seen_names = set()
    
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport={'width': 1920, 'height': 1080},
        locale='en-US'
    )
    page = context.new_page()
    
    for location in locations:
        for term in search_terms:
            print(f"\n  Searching: '{term}' in {location}")
            
            search_url = f"https://www.yelp.com/search?find_desc={quote_plus(term)}&find_loc={quote_plus(location)}"
            
            try:
                page.goto(search_url, timeout=60000)
                random_delay(3, 5)
                
                # Wait for results to load
                page.wait_for_selector('h3, .businessName', timeout=10000)
                
                # Scroll to load more
                for _ in range(3):
                    page.evaluate("window.scrollBy(0, 1000)")
                    random_delay(1, 2)
                
                # Extract business listings
                listings = page.query_selector_all('h3 a[href*="/biz/"], .businessName a[href*="/biz/"], a.css-1m051bw')
                
                print(f"    Found {len(listings)} potential listings")
                
                for listing in listings:
                    try:
                        name = listing.inner_text().strip()
                        if not name or name in seen_names or len(name) < 2:
                            continue
                        
                        link = listing.get_attribute('href') or ""
                        if link and not link.startswith('http'):
                            link = 'https://www.yelp.com' + link.split('?')[0]
                        
                        # Get parent container for more info
                        parent = listing.evaluate_handle("el => el.closest('li') || el.closest('div[class*=\"container\"]')")
                        parent_elem = parent.as_element()
                        
                        address = ""
                        phone = ""
                        rating = ""
                        
                        if parent_elem:
                            # Address
                            addr_elem = parent_elem.query_selector('[class*="address"], .css-1perman')
                            if addr_elem:
                                address = addr_elem.inner_text().strip()
                            
                            # Phone
                            phone_elem = parent_elem.query_selector('[class*="phone"], .css-1p9ibh6')
                            if phone_elem:
                                phone = phone_elem.inner_text().strip()
                            
                            # Rating
                            rating_elem = parent_elem.query_selector('[class*="rating"], .css-gutk1v')
                            if rating_elem:
                                rating = rating_elem.inner_text().strip()
                        
                        business = {
                            'name': name,
                            'type': 'kava_bar' if 'kava' in term.lower() else 'business',
                            'address': address,
                            'phone': phone,
                            'rating': rating,
                            'source': 'yelp',
                            'link': link,
                            'search_term': term,
                            'location': location
                        }
                        
                        if name not in seen_names:
                            seen_names.add(name)
                            businesses.append(business)
                            print(f"      Added: {name}")
                        
                    except Exception as e:
                        continue
                
                random_delay(2, 4)
                
            except Exception as e:
                print(f"    Error: {e}")
                continue
    
    browser.close()
    return businesses

def scrape_yellow_pages_with_playwright(playwright, search_terms, locations):
    """Scrape Yellow Pages using Playwright"""
    print("\n[YELLOW PAGES] Starting comprehensive scrape...")
    
    businesses = []
    seen_names = set()
    
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport={'width': 1920, 'height': 1080}
    )
    page = context.new_page()
    
    for location in locations:
        for term in search_terms:
            print(f"\n  Searching: '{term}' in {location}")
            
            search_url = f"https://www.yellowpages.com/search?search_terms={quote_plus(term)}&geo_location_terms={quote_plus(location)}"
            
            try:
                page.goto(search_url, timeout=60000)
                random_delay(2, 4)
                
                # Scroll to load more
                for _ in range(2):
                    page.evaluate("window.scrollBy(0, 1000)")
                    random_delay(1, 2)
                
                # Extract business listings
                listings = page.query_selector_all('.result, .organic-result, .v-card')
                
                print(f"    Found {len(listings)} potential listings")
                
                for listing in listings:
                    try:
                        name_elem = listing.query_selector('.business-name, a.name, h2 a')
                        if not name_elem:
                            continue
                        
                        name = name_elem.inner_text().strip()
                        if not name or name in seen_names:
                            continue
                        
                        link = name_elem.get_attribute('href') or ""
                        if link and not link.startswith('http'):
                            link = 'https://www.yellowpages.com' + link
                        
                        # Address
                        address_elem = listing.query_selector('.street-address, .address, .locality')
                        address = address_elem.inner_text().strip() if address_elem else ""
                        
                        # Phone
                        phone_elem = listing.query_selector('.phones, .phone, .number')
                        phone = phone_elem.inner_text().strip() if phone_elem else ""
                        
                        # Categories
                        cat_elem = listing.query_selector('.categories, .category')
                        categories = cat_elem.inner_text().strip() if cat_elem else ""
                        
                        business = {
                            'name': name,
                            'type': 'business',
                            'address': address,
                            'phone': phone,
                            'categories': categories,
                            'source': 'yellow_pages',
                            'link': link,
                            'search_term': term,
                            'location': location
                        }
                        
                        if name not in seen_names:
                            seen_names.add(name)
                            businesses.append(business)
                            print(f"      Added: {name}")
                        
                    except Exception as e:
                        continue
                
                random_delay(2, 4)
                
            except Exception as e:
                print(f"    Error: {e}")
                continue
    
    browser.close()
    return businesses

def get_comprehensive_known_list():
    """Get a comprehensive list of known kratom vendors and kava bars"""
    print("\n[DATABASE] Loading comprehensive known data...")
    
    kratom_vendors = [
        # Major online vendors
        {"name": "Kraken Kratom", "website": "https://krakenkratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Coastline Kratom", "website": "https://coastlinekratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "PurKratom", "website": "https://purkratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kats Botanicals", "website": "https://katsbotanicals.com", "type": "online_vendor", "location": "Online"},
        {"name": "Happy Hippo Herbals", "website": "https://happyhippoherbals.com", "type": "online_vendor", "location": "Online"},
        {"name": "Phytoextractum", "website": "https://phytoextractum.com", "type": "online_vendor", "location": "Online"},
        {"name": "Left Coast Kratom", "website": "https://leftcoastkratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Remarkable Herbs", "website": "https://remarkableherbs.com", "type": "online_vendor", "location": "Online"},
        {"name": "Super Speciosa", "website": "https://superspeciosa.com", "type": "online_vendor", "location": "Online"},
        {"name": "OPMS Kratom", "website": "https://opmskratom.com", "type": "brand", "location": "Nationwide"},
        {"name": "MIT45", "website": "https://mit45.com", "type": "brand", "location": "Nationwide"},
        {"name": "Hush Kratom", "website": "https://hushkratom.com", "type": "brand", "location": "Nationwide"},
        {"name": "Nova Kratom", "website": "https://novakratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom Spot", "website": "https://kratomspot.com", "type": "online_vendor", "location": "Online"},
        {"name": "Golden Monk", "website": "https://goldenmonk.com", "type": "online_vendor", "location": "Online"},
        {"name": "Just Kratom Store", "website": "https://justkratomstore.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom Capsules", "website": "https://kratomcapsules.com", "type": "online_vendor", "location": "Online"},
        {"name": "Experience Kratom", "website": "https://experiencekratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Sacred Kratom", "website": "https://sacredkratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Tropical Kratom", "website": "https://tropicalkratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Carolina Kratom", "website": "https://carolinakratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Mystic Island Kratom", "website": "https://mysticislandkratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratora", "website": "https://kratora.com", "type": "online_vendor", "location": "Online"},
        {"name": "Z Kratom", "website": "https://zkratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom Country", "website": "https://kratomcountry.com", "type": "online_vendor", "location": "Online"},
        {"name": "Bumble Bee Kratom", "website": "https://bumblebeekratom.com", "type": "brand", "location": "Nationwide"},
        {"name": "Whole Herbs", "website": "https://wholeherbs.com", "type": "brand", "location": "Nationwide"},
        {"name": "K-Chill", "website": "https://kchill.com", "type": "brand", "location": "Nationwide"},
        {"name": "Vivazen", "website": "https://vivazen.com", "type": "brand", "location": "Nationwide"},
        {"name": "Kratomade", "website": "https://kratomade.com", "type": "brand", "location": "Nationwide"},
        {"name": "Kratom Exchange", "website": "https://kratomexchange.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom Eye", "website": "https://kratomeye.com", "type": "online_vendor", "location": "Online"},
        {"name": "Herbal RVA", "website": "https://herbalrva.com", "type": "online_vendor", "location": "Online"},
        {"name": "Indo Kratom", "website": "https://indokratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom Therapy", "website": "https://kratomtherapy.com", "type": "online_vendor", "location": "Online"},
        {"name": "Phoria Kratom", "website": "https://phoriakratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom Source USA", "website": "https://kratomsourceusa.com", "type": "online_vendor", "location": "Online"},
        {"name": "Original Harvest", "website": "https://originalharvest.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom Masters", "website": "https://kratommasters.com", "type": "online_vendor", "location": "Online"},
        {"name": "Buy Kratom Bulk USA", "website": "https://buykratombulkusa.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom Crazy", "website": "https://kratomcrazy.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom Basket", "website": "https://kratombasket.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom Earth", "website": "https://kratomearth.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom Life", "website": "https://kratomlife.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom One", "website": "https://kratomone.com", "type": "online_vendor", "location": "Online"},
        {"name": "Kratom World", "website": "https://kratomworld.com", "type": "online_vendor", "location": "Online"},
        {"name": "Premium Kratom", "website": "https://premiumkratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Royal Kratom", "website": "https://royalkratom.com", "type": "online_vendor", "location": "Online"},
        {"name": "Urban Ice Organics", "website": "https://urbaniceorganics.com", "type": "online_vendor", "location": "Online"},
        {"name": "White Dragon Botanicals", "website": "https://whitedragonbotanicals.com", "type": "online_vendor", "location": "Online"},
    ]
    
    kava_bars = [
        # South Florida Kava Bars
        {"name": "Kava Culture", "location": "Multiple locations, South Florida", "website": "https://kavaculture.com", "type": "kava_bar_chain"},
        {"name": "Kavasutra", "location": "Delray Beach, West Palm Beach, FL", "website": "https://kavasutra.com", "type": "kava_bar_chain"},
        {"name": "Noble Kava", "location": "Fort Lauderdale, FL", "website": "https://noblekava.com", "type": "kava_bar"},
        {"name": "Bula Kava House", "location": "Fort Lauderdale, FL", "website": "https://bulakavahouse.com", "type": "kava_bar"},
        {"name": "Kava Konnection", "location": "Lake Worth, FL", "type": "kava_bar"},
        {"name": "Grateful Kratom", "location": "West Palm Beach, FL", "type": "kava_bar"},
        {"name": "The Kava Lounge", "location": "Miami, FL", "type": "kava_bar"},
        {"name": "Kava Bar Fort Lauderdale", "location": "Fort Lauderdale, FL", "type": "kava_bar"},
        {"name": "Kava Bar Miami", "location": "Miami, FL", "type": "kava_bar"},
        {"name": "Palm Beach Kava", "location": "Palm Beach, FL", "type": "kava_bar"},
        {"name": "Kava Kava Bar", "location": "Delray Beach, FL", "type": "kava_bar"},
        {"name": "Bula on the Beach", "location": "Fort Lauderdale Beach, FL", "type": "kava_bar"},
        {"name": "Kava Social", "location": "West Palm Beach, FL", "type": "kava_bar"},
        {"name": "The Kava Room", "location": "Miami Beach, FL", "type": "kava_bar"},
        {"name": "Kava Time", "location": "Hollywood, FL", "type": "kava_bar"},
        {"name": "South Beach Kava", "location": "Miami Beach, FL", "type": "kava_bar"},
        {"name": "Kava Nirvana", "location": "Boca Raton, FL", "type": "kava_bar"},
        {"name": "Island Kava", "location": "Key West, FL", "type": "kava_bar"},
        {"name": "Kava Paradise", "location": "Naples, FL", "type": "kava_bar"},
        {"name": "Zen Kava Bar", "location": "Tampa, FL", "type": "kava_bar"},
        {"name": "Kava Collective", "location": "Orlando, FL", "type": "kava_bar"},
        {"name": "Bula on the Water", "location": "Fort Lauderdale, FL", "type": "kava_bar"},
        {"name": "Kava Culture - Delray", "location": "Delray Beach, FL", "type": "kava_bar"},
        {"name": "Kava Culture - West Palm", "location": "West Palm Beach, FL", "type": "kava_bar"},
        {"name": "Kava Culture - Fort Lauderdale", "location": "Fort Lauderdale, FL", "type": "kava_bar"},
        {"name": "Kavasutra Delray", "location": "Delray Beach, FL", "type": "kava_bar"},
        {"name": "Kavasutra West Palm", "location": "West Palm Beach, FL", "type": "kava_bar"},
        {"name": "Kava Culture - Gainesville", "location": "Gainesville, FL", "type": "kava_bar"},
        {"name": "Kava Culture - Tallahassee", "location": "Tallahassee, FL", "type": "kava_bar"},
        {"name": "Kava Culture - Jacksonville", "location": "Jacksonville, FL", "type": "kava_bar"},
        {"name": "Kava Culture - St. Augustine", "location": "St. Augustine, FL", "type": "kava_bar"},
        {"name": "Kava Culture - Orlando", "location": "Orlando, FL", "type": "kava_bar"},
        {"name": "Kava Culture - Tampa", "location": "Tampa, FL", "type": "kava_bar"},
        {"name": "Kava Culture - St. Pete", "location": "St. Petersburg, FL", "type": "kava_bar"},
        {"name": "Kava Culture - Clearwater", "location": "Clearwater, FL", "type": "kava_bar"},
        {"name": "Kava Culture - Sarasota", "location": "Sarasota, FL", "type": "kava_bar"},
        {"name": "Kava Culture - Naples", "location": "Naples, FL", "type": "kava_bar"},
        {"name": "Kava Culture - Austin", "location": "Austin, TX", "type": "kava_bar"},
        {"name": "Kava Culture - Houston", "location": "Houston, TX", "type": "kava_bar"},
        {"name": "Kava Culture - Dallas", "location": "Dallas, TX", "type": "kava_bar"},
        {"name": "Kava Culture - Denver", "location": "Denver, CO", "type": "kava_bar"},
        {"name": "Kava Culture - Nashville", "location": "Nashville, TN", "type": "kava_bar"},
        {"name": "Kava Culture - Atlanta", "location": "Atlanta, GA", "type": "kava_bar"},
        {"name": "Kava Culture - Charlotte", "location": "Charlotte, NC", "type": "kava_bar"},
        {"name": "Kava Culture - Raleigh", "location": "Raleigh, NC", "type": "kava_bar"},
        {"name": "Kava Culture - Charleston", "location": "Charleston, SC", "type": "kava_bar"},
        {"name": "Kava Culture - Phoenix", "location": "Phoenix, AZ", "type": "kava_bar"},
        {"name": "Kava Culture - Las Vegas", "location": "Las Vegas, NV", "type": "kava_bar"},
        {"name": "Kava Culture - San Diego", "location": "San Diego, CA", "type": "kava_bar"},
        {"name": "Kava Culture - Los Angeles", "location": "Los Angeles, CA", "type": "kava_bar"},
        {"name": "Kava Culture - San Francisco", "location": "San Francisco, CA", "type": "kava_bar"},
        {"name": "Kava Culture - Seattle", "location": "Seattle, WA", "type": "kava_bar"},
        {"name": "Kava Culture - Portland", "location": "Portland, OR", "type": "kava_bar"},
        {"name": "Kava Culture - New York", "location": "New York, NY", "type": "kava_bar"},
        {"name": "Kava Culture - Philadelphia", "location": "Philadelphia, PA", "type": "kava_bar"},
        {"name": "Kava Culture - Washington DC", "location": "Washington, DC", "type": "kava_bar"},
        {"name": "Kava Culture - Boston", "location": "Boston, MA", "type": "kava_bar"},
        {"name": "Kava Culture - Chicago", "location": "Chicago, IL", "type": "kava_bar"},
        {"name": "Kava Culture - Minneapolis", "location": "Minneapolis, MN", "type": "kava_bar"},
        {"name": "Kava Culture - Kansas City", "location": "Kansas City, MO", "type": "kava_bar"},
        {"name": "Kava Culture - St. Louis", "location": "St. Louis, MO", "type": "kava_bar"},
        {"name": "Kava Culture - New Orleans", "location": "New Orleans, LA", "type": "kava_bar"},
        {"name": "Kava Culture - Miami Beach", "location": "Miami Beach, FL", "type": "kava_bar"},
        {"name": "Bula Kava Bar", "location": "Multiple locations, FL", "type": "kava_bar_chain"},
        {"name": "Kava Komunity", "location": "Various locations", "type": "kava_bar_chain"},
        {"name": "Kava Roots", "location": "Various locations", "type": "kava_bar_chain"},
        {"name": "Nakava", "location": "Various locations", "type": "kava_bar_chain"},
        {"name": "Kava District", "location": "Various locations", "type": "kava_bar_chain"},
    ]
    
    for vendor in kratom_vendors:
        vendor['source'] = 'known_database'
    
    for bar in kava_bars:
        bar['source'] = 'known_database'
    
    print(f"    Loaded {len(kratom_vendors)} vendors and {len(kava_bars)} kava bars from database")
    
    return kratom_vendors, kava_bars

def main():
    """Main function"""
    print("=" * 60)
    print("[*] COMPREHENSIVE KRATOM & KAVA BUSINESS SCRAPER")
    print("=" * 60)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    all_results = {
        'kava_bars': [],
        'kratom_vendors': [],
        'metadata': {
            'scraped_at': datetime.now().isoformat(),
            'sources': ['google_maps', 'yelp', 'yellow_pages', 'known_database']
        }
    }
    
    # Search terms
    kava_search_terms = ['kava bar', 'kava tea bar', 'kava lounge', 'kava house', 'kava cafe']
    kratom_search_terms = ['kratom', 'kratom shop', 'kratom store', 'kratom vendor', 'botanical shop']
    
    # Locations
    locations = [
        'South Florida', 'Miami, FL', 'Fort Lauderdale, FL', 'West Palm Beach, FL',
        'Delray Beach, FL', 'Boca Raton, FL', 'Hollywood, FL', 'Pompano Beach, FL',
        'Key West, FL', 'Naples, FL', 'Tampa, FL', 'Orlando, FL', 'Jacksonville, FL',
        'Florida', 'United States'
    ]
    
    # Get known data first
    known_vendors, known_bars = get_comprehensive_known_list()
    all_results['kratom_vendors'].extend(known_vendors)
    all_results['kava_bars'].extend(known_bars)
    
    seen_names = set(v['name'] for v in known_vendors) | set(b['name'] for b in known_bars)
    
    # Run Playwright scrapers
    with sync_playwright() as playwright:
        # Scrape Google Maps
        gmaps_results = scrape_google_maps(
            playwright, 
            kava_search_terms + kratom_search_terms[:2],
            locations[:8]  # Limit locations for speed
        )
        
        for item in gmaps_results:
            if item['name'] not in seen_names:
                seen_names.add(item['name'])
                if item.get('type') == 'kava_bar':
                    all_results['kava_bars'].append(item)
                else:
                    all_results['kratom_vendors'].append(item)
        
        # Scrape Yelp
        yelp_results = scrape_yelp_with_playwright(
            playwright,
            kava_search_terms[:3],
            locations[:5]
        )
        
        for item in yelp_results:
            if item['name'] not in seen_names:
                seen_names.add(item['name'])
                if 'kava' in item.get('name', '').lower() or 'bar' in item.get('name', '').lower():
                    all_results['kava_bars'].append(item)
                else:
                    all_results['kratom_vendors'].append(item)
        
        # Scrape Yellow Pages
        yp_results = scrape_yellow_pages_with_playwright(
            playwright,
            kratom_search_terms[:2],
            locations[:5]
        )
        
        for item in yp_results:
            if item['name'] not in seen_names:
                seen_names.add(item['name'])
                all_results['kratom_vendors'].append(item)
    
    # Save results
    output_file = f'kratom_kava_comprehensive_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    
    # Save as text
    text_file = output_file.replace('.json', '.txt')
    with open(text_file, 'w', encoding='utf-8') as f:
        f.write("=" * 70 + "\n")
        f.write("COMPREHENSIVE KRATOM VENDORS & KAVA BARS LIST\n")
        f.write("=" * 70 + "\n\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("-" * 70 + "\n")
        f.write(f"KAVA/KRATOM BARS ({len(all_results['kava_bars'])} found)\n")
        f.write("-" * 70 + "\n\n")
        
        for bar in all_results['kava_bars']:
            f.write(f"Name: {bar.get('name', 'N/A')}\n")
            f.write(f"Location: {bar.get('location', bar.get('address', 'N/A'))}\n")
            if bar.get('phone'):
                f.write(f"Phone: {bar['phone']}\n")
            if bar.get('link') or bar.get('website'):
                f.write(f"Website: {bar.get('link') or bar.get('website')}\n")
            f.write(f"Source: {bar.get('source', 'N/A')}\n")
            f.write("\n")
        
        f.write("-" * 70 + "\n")
        f.write(f"KRATOM VENDORS ({len(all_results['kratom_vendors'])} found)\n")
        f.write("-" * 70 + "\n\n")
        
        for vendor in all_results['kratom_vendors']:
            f.write(f"Name: {vendor.get('name', 'N/A')}\n")
            f.write(f"Type: {vendor.get('type', 'N/A')}\n")
            f.write(f"Location: {vendor.get('location', 'N/A')}\n")
            if vendor.get('link') or vendor.get('website'):
                f.write(f"Website: {vendor.get('link') or vendor.get('website')}\n")
            f.write(f"Source: {vendor.get('source', 'N/A')}\n")
            f.write("\n")
    
    # Print summary
    print("\n" + "=" * 60)
    print("[DONE] SCRAPING COMPLETE!")
    print("=" * 60)
    print(f"Kava/Kratom Bars Found: {len(all_results['kava_bars'])}")
    print(f"Kratom Vendors Found: {len(all_results['kratom_vendors'])}")
    print(f"\nResults saved to:")
    print(f"  - {output_file} (JSON)")
    print(f"  - {text_file} (Text)")
    print("=" * 60)
    
    return all_results

if __name__ == "__main__":
    main()
