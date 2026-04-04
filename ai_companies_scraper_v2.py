#!/usr/bin/env python3
"""
AI & Visual AI Consulting Company Scraper - VERSION 2
More targeted searches with better filtering
Focuses on actual AI/ML companies, excludes hardware/IT repair
"""

import asyncio
import json
import re
import os
from datetime import datetime
from playwright.async_api import async_playwright

OUTPUT_FILE = f"ai_companies_v2_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

# MORE TARGETED search queries - specific to actual AI companies
SEARCH_QUERIES = {
    "ai_ml_development": [
        "machine learning development company",
        "artificial intelligence software development",
        "ML model development services",
        "deep learning company",
        "neural network development",
        "AI software engineering firm",
    ],
    "visual_ai_cv": [
        "computer vision AI company",
        "image recognition software development",
        "video AI analysis platform",
        "visual AI solutions",
        "object detection AI services",
        "AI video generation platform",
    ],
    "rag_llm": [
        "LLM implementation services",
        "large language model consulting",
        "RAG retrieval augmented generation company",
        "vector database services",
        "AI chatbot development company",
        "NLP natural language processing company",
    ],
    "ai_infrastructure": [
        "enterprise AI platform company",
        "AI infrastructure services",
        "MLOps platform company",
        "AI deployment services",
        "machine learning operations company",
        "AI model deployment platform",
    ],
    "ai_consulting_strategy": [
        "AI strategy consulting firm",
        "artificial intelligence advisory services",
        "AI transformation consulting",
        "machine learning strategy consulting",
        "AI implementation partner",
    ],
    "ai_automation": [
        "AI automation company",
        "intelligent automation services",
        "AI workflow automation platform",
        "cognitive automation company",
        "AI process automation services",
    ],
}

# Categories to EXCLUDE (not AI companies)
EXCLUDE_CATEGORIES = [
    "computer repair",
    "pc repair",
    "hardware",
    "it support",
    "network support",
    "cabling",
    "electrician",
    "plumbing",
    "hvac",
    "landscaping",
    "restaurant",
    "food",
    "retail store",
    "clothing",
    "furniture",
    "real estate",
    "property management",
    "auto repair",
    "car wash",
    "salon",
    "spa",
    "gym",
    "fitness",
    "dental",
    "medical",
    "healthcare",
    "pharmacy",
    "veterinarian",
    "pet",
    "church",
    "school",
    "education",
    "attorney",
    "lawyer",
    "accounting",
    "tax",
    "insurance",
    "bank",
    "financial advisor",
    "mortgage",
    "loan",
]

# Categories that indicate AI companies (must have at least one)
AI_INDICATOR_CATEGORIES = [
    "software",
    "ai",
    "artificial intelligence",
    "machine learning",
    "ml",
    "data science",
    "analytics",
    "automation",
    "technology",
    "tech",
    "consulting",
    "solutions",
    "platform",
    "development",
    "engineering",
    "digital",
    "innovation",
    "intelligence",
    "cognitive",
    "neural",
    "deep learning",
    "nlp",
    "computer vision",
    "robotics",
    "saas",
    "cloud",
    "enterprise",
]

# Target locations
LOCATIONS = [
    {"name": "South Florida", "cities": ["Miami FL", "Fort Lauderdale FL", "West Palm Beach FL", "Boca Raton FL"]},
    {"name": "San Francisco CA", "cities": ["San Francisco CA", "San Jose CA", "Palo Alto CA", "Mountain View CA"]},
    {"name": "Denver CO", "cities": ["Denver CO", "Boulder CO"]},
    {"name": "Detroit MI", "cities": ["Detroit MI", "Ann Arbor MI"]},
    {"name": "Chicago IL", "cities": ["Chicago IL"]},
    {"name": "Saint Louis MO", "cities": ["Saint Louis MO"]},
    {"name": "Cleveland OH", "cities": ["Cleveland OH"]},
    {"name": "Bentonville AR", "cities": ["Bentonville AR", "Fayetteville AR"]},
]

def is_ai_company(category, name):
    """Check if this is likely an AI company based on category and name"""
    category_lower = (category or "").lower()
    name_lower = (name or "").lower()
    
    # Exclude non-AI categories
    for exclude in EXCLUDE_CATEGORIES:
        if exclude in category_lower:
            return False
    
    # Check for AI indicators
    has_ai_indicator = False
    for indicator in AI_INDICATOR_CATEGORIES:
        if indicator in category_lower or indicator in name_lower:
            has_ai_indicator = True
            break
    
    # Also check name for AI-specific terms
    ai_name_terms = ["ai ", "artificial intelligence", "machine learning", "ml ", "deep learning", 
                     "neural", "nlp", "computer vision", "llm", "gpt", "chatgpt", "openai",
                     "data science", "analytics", "automation", "cognitive", "intelligence"]
    for term in ai_name_terms:
        if term in name_lower:
            has_ai_indicator = True
            break
    
    return has_ai_indicator

def classify_business_type(name, category):
    """Classify the business into a specific type"""
    name_lower = (name or "").lower()
    category_lower = (category or "").lower()
    combined = name_lower + " " + category_lower
    
    if any(x in combined for x in ["vision", "image", "video", "visual", "recognition", "detection", "cv"]):
        return "Visual AI / Computer Vision"
    elif any(x in combined for x in ["llm", "language model", "rag", "chatbot", "nlp", "gpt", "chat", "conversational"]):
        return "RAG / LLM / NLP"
    elif any(x in combined for x in ["infrastructure", "mlops", "deployment", "platform", "enterprise ai"]):
        return "AI Infrastructure / MLOps"
    elif any(x in combined for x in ["automation", "workflow", "process", "robotic"]):
        return "AI Automation"
    elif any(x in combined for x in ["consulting", "advisory", "strategy", "transformation"]):
        return "AI Consulting / Strategy"
    elif any(x in combined for x in ["data science", "analytics", "data analytics", "business intelligence"]):
        return "Data Science / Analytics"
    else:
        return "AI / ML Development"

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
        for _ in range(2):
            await page.evaluate('document.querySelector("#QA0Szd")?.scrollTo(0, document.body.scrollHeight)')
            await page.wait_for_timeout(1500)
        
        # Get all business listings
        listings = await page.query_selector_all('div.Nv2PK')
        
        for listing in listings[:15]:  # Limit to top 15 per search
            try:
                # Get business name
                name_el = await listing.query_selector('div.qBF1Pd')
                name = await name_el.inner_text() if name_el else "Unknown"
                
                # Get link to business page
                link_el = await listing.query_selector('a.hfpxzc')
                link = await link_el.get_attribute('href') if link_el else None
                
                # Get category
                category_el = await listing.query_selector('div.W4Efsd:last-child span:first-child')
                category = await category_el.inner_text() if category_el else ""
                
                # Filter: Must be an AI company
                if not is_ai_company(category, name):
                    continue
                
                # Get address info
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
                
                # Classify business type
                business_type = classify_business_type(name, category)
                
                if name and link:
                    businesses.append({
                        'name': name,
                        'link': link,
                        'address': address_text,
                        'rating': rating,
                        'phone': phone,
                        'category': category,
                        'business_type': business_type,
                        'search_query': query,
                        'location': location,
                    })
            except Exception as e:
                continue
        
        print(f"    Found {len(businesses)} AI companies (filtered)")
        
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
        
        print(f"    Scraped: {name[:40]}...")
        
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
        print("AI COMPANIES SCRAPER V2 - Targeted Search with Filtering")
        print("="*80)
        
        for location_group in LOCATIONS:
            region = location_group['name']
            print(f"\n--- Region: {region} ---")
            
            for city in location_group['cities']:
                print(f"\nCity: {city}")
                
                for category, queries in SEARCH_QUERIES.items():
                    print(f"\n  Category: {category}")
                    
                    for query in queries[:1]:  # Use only 1 query per category per city for V2
                        businesses = await scrape_google_maps(page, query, city)
                        
                        for b in businesses:
                            # Deduplicate by name
                            key = f"{b['name']}_{city}".lower()
                            if key not in seen_names:
                                seen_names.add(key)
                                b['region'] = region
                                b['search_category'] = category
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
            
            # Save progress every 20 businesses
            if (i + 1) % 20 == 0:
                with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                    json.dump({
                        'scraped_date': datetime.now().isoformat(),
                        'version': '2.0',
                        'total_businesses': len(all_businesses),
                        'businesses': all_businesses
                    }, f, indent=2, ensure_ascii=False)
                print(f"\n  Progress saved to {OUTPUT_FILE}")
            
            await page.wait_for_timeout(800)  # Rate limiting
        
        await browser.close()
    
    # Final save
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump({
            'scraped_date': datetime.now().isoformat(),
            'version': '2.0',
            'total_businesses': len(all_businesses),
            'businesses': all_businesses
        }, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "="*80)
    print("SCRAPING COMPLETE!")
    print("="*80)
    print(f"Total AI companies found: {len(all_businesses)}")
    print(f"Results saved to: {OUTPUT_FILE}")
    
    # Stats by region
    print("\nBy Region:")
    for location_group in LOCATIONS:
        region = location_group['name']
        count = sum(1 for b in all_businesses if b.get('region') == region)
        print(f"  {region}: {count}")
    
    # Stats by business type
    print("\nBy Business Type:")
    business_types = {}
    for b in all_businesses:
        bt = b.get('business_type', 'Unknown')
        business_types[bt] = business_types.get(bt, 0) + 1
    for bt, count in sorted(business_types.items(), key=lambda x: -x[1]):
        print(f"  {bt}: {count}")
    
    # Contact info stats
    with_phone = sum(1 for b in all_businesses if b.get('phone'))
    with_website = sum(1 for b in all_businesses if b.get('website'))
    print(f"\nWith Phone Numbers: {with_phone}")
    print(f"With Websites: {with_website}")

if __name__ == "__main__":
    asyncio.run(main())