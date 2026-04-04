#!/usr/bin/env python3
"""
Generate AI Companies Directory V2 - Filtered for AI Consultants, Coaches & Agencies
Excludes hardware/computer repair shops
"""

import json
from datetime import datetime
from collections import defaultdict

# Load the JSON data
with open('ai_companies_v2_20260216_133614.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

businesses = data['businesses']

# Categories to EXCLUDE (not AI companies)
EXCLUDE_CATEGORIES = [
    "computer repair", "pc repair", "hardware repair", "laptop repair",
    "it support", "it service", "network support", "cabling", 
    "electrician", "plumbing", "hvac", "landscaping",
    "car wash", "auto repair", "mechanic", "tire shop",
    "restaurant", "food", "bakery", "cafe",
    "salon", "spa", "barber", "beauty",
    "real estate", "property management", "apartment",
    "car rental", "auto rental", "vehicle rental",
    "moving company", "storage", "warehouse",
    "print shop", "sign shop", "printing",
    "locksmith", "security guard", "guard service"
]

# Keywords that indicate REAL AI companies
AI_KEYWORDS = [
    "ai", "artificial intelligence", "machine learning", "ml", "deep learning",
    "neural", "nlp", "natural language", "computer vision", "cv",
    "llm", "large language", "gpt", "chatgpt", "openai", "claude",
    "rag", "retrieval", "embedding", "transformer",
    "automation", "robotics", "autonomous",
    "data science", "analytics", "predictive", "forecasting",
    "software", "app development", "web development", "mobile development",
    "consulting", "consultant", "strategy", "advisory",
    "technology", "tech", "digital", "cloud", "saas", "platform"
]

def is_valid_ai_company(business):
    """Check if this is a valid AI company (not hardware/repair)"""
    name = business.get('name', '').lower()
    category = business.get('category', '').lower()
    business_type = business.get('business_type', '').lower()
    
    # Check if category contains excluded terms
    for exclude in EXCLUDE_CATEGORIES:
        if exclude in category:
            return False
    
    # Check if name or business type contains AI keywords
    has_ai_keyword = False
    for keyword in AI_KEYWORDS:
        if keyword in name or keyword in business_type or keyword in category:
            has_ai_keyword = True
            break
    
    # Also accept if business_type is one of our AI categories
    valid_types = [
        "ai / ml development", "visual ai / computer vision", 
        "rag / llm / nlp", "ai infrastructure / mlops",
        "ai consulting / strategy", "ai automation",
        "data science / analytics"
    ]
    
    for vt in valid_types:
        if vt in business_type.lower():
            has_ai_keyword = True
            break
    
    return has_ai_keyword

def get_priority_score(business):
    """Score business by relevance to AI consulting"""
    name = business.get('name', '').lower()
    category = business.get('category', '').lower()
    business_type = business.get('business_type', '').lower()
    
    score = 0
    
    # Highest priority: AI Consulting
    if 'consulting' in business_type or 'strategy' in business_type:
        score += 100
    if 'consulting' in name or 'consultant' in name:
        score += 50
    
    # High priority: AI/ML Development
    if 'ai' in name or 'artificial intelligence' in name:
        score += 80
    if 'machine learning' in name or 'ml' in name:
        score += 70
    if 'llm' in name or 'gpt' in name:
        score += 70
    
    # Medium priority: Visual AI, RAG, etc.
    if 'vision' in name or 'computer vision' in business_type:
        score += 60
    if 'automation' in business_type:
        score += 40
    
    # Has contact info
    if business.get('phone'):
        score += 10
    if business.get('website'):
        score += 10
    
    return score

# Filter and categorize businesses
filtered_businesses = []
for b in businesses:
    if is_valid_ai_company(b):
        b['priority_score'] = get_priority_score(b)
        filtered_businesses.append(b)

# Remove duplicates based on name
seen_names = set()
unique_businesses = []
for b in filtered_businesses:
    name_lower = b.get('name', '').lower().strip()
    if name_lower not in seen_names:
        seen_names.add(name_lower)
        unique_businesses.append(b)

# Sort by priority score
unique_businesses.sort(key=lambda x: x.get('priority_score', 0), reverse=True)

# Group by business type
by_type = defaultdict(list)
for b in unique_businesses:
    by_type[b.get('business_type', 'Other')].append(b)

# Group by region
by_region = defaultdict(list)
for b in unique_businesses:
    by_region[b.get('region', 'Other')].append(b)

# Generate HTML
html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI & Visual AI Consultants Directory - {len(unique_businesses)} Companies</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            color: #e0e0e0;
            min-height: 100vh;
            line-height: 1.6;
        }}
        .header {{
            background: linear-gradient(90deg, #1a1a2e 0%, #16213e 100%);
            padding: 40px 20px;
            text-align: center;
            border-bottom: 3px solid #00d4ff;
            box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
        }}
        .header h1 {{
            color: #FFD700;
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }}
        .header .subtitle {{
            color: #00d4ff;
            font-size: 1.3em;
            margin-bottom: 20px;
        }}
        .grand-total {{
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000;
            font-size: 3em;
            font-weight: bold;
            padding: 30px 60px;
            border-radius: 20px;
            display: inline-block;
            margin: 20px 0;
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.5);
        }}
        .grand-total-label {{
            color: #aaa;
            font-size: 1.2em;
            margin-top: 10px;
        }}
        .stats {{
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
            margin: 30px auto;
            max-width: 1200px;
            padding: 0 20px;
        }}
        .stat-box {{
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid #00d4ff;
            border-radius: 15px;
            padding: 20px 30px;
            text-align: center;
        }}
        .stat-box .number {{
            color: #00d4ff;
            font-size: 2em;
            font-weight: bold;
        }}
        .stat-box .label {{
            color: #888;
            font-size: 0.9em;
        }}
        .nav {{
            background: rgba(0, 0, 0, 0.5);
            padding: 15px;
            position: sticky;
            top: 0;
            z-index: 100;
            backdrop-filter: blur(10px);
        }}
        .nav-inner {{
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }}
        .nav a {{
            color: #00d4ff;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 20px;
            background: rgba(0, 212, 255, 0.1);
            transition: all 0.3s;
        }}
        .nav a:hover {{
            background: #00d4ff;
            color: #000;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }}
        .section {{
            margin: 40px 0;
        }}
        .section-title {{
            color: #FFD700;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #FFD700;
        }}
        .region-title {{
            color: #00d4ff;
            font-size: 1.5em;
            margin: 30px 0 15px;
            padding-left: 15px;
            border-left: 4px solid #00d4ff;
        }}
        .business-type-title {{
            color: #FFA500;
            font-size: 1.3em;
            margin: 25px 0 15px;
            padding-left: 15px;
            border-left: 4px solid #FFA500;
        }}
        .companies-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }}
        .company-card {{
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            transition: all 0.3s;
        }}
        .company-card:hover {{
            background: rgba(255, 255, 255, 0.1);
            border-color: #00d4ff;
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
        }}
        .company-name {{
            color: #FFD700;
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
        }}
        .company-type {{
            display: inline-block;
            background: linear-gradient(90deg, #00d4ff 0%, #0099cc 100%);
            color: #000;
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 0.8em;
            font-weight: bold;
            margin-bottom: 10px;
        }}
        .company-info {{
            color: #aaa;
            font-size: 0.9em;
            margin: 5px 0;
        }}
        .company-info strong {{
            color: #00d4ff;
        }}
        .company-contact {{
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }}
        .phone {{
            color: #4CAF50;
            font-weight: bold;
        }}
        .website {{
            color: #00d4ff;
            text-decoration: none;
            word-break: break-all;
        }}
        .website:hover {{
            text-decoration: underline;
        }}
        .rating {{
            display: inline-block;
            background: #FFD700;
            color: #000;
            padding: 2px 8px;
            border-radius: 5px;
            font-size: 0.85em;
            font-weight: bold;
        }}
        .footer {{
            text-align: center;
            padding: 40px;
            color: #666;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 40px;
        }}
        .footer .date {{
            color: #00d4ff;
        }}
        @media (max-width: 768px) {{
            .header h1 {{
                font-size: 1.8em;
            }}
            .grand-total {{
                font-size: 2em;
                padding: 20px 40px;
            }}
            .companies-grid {{
                grid-template-columns: 1fr;
            }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 AI & Visual AI Consultants Directory</h1>
        <div class="subtitle">Machine Learning • Computer Vision • LLM/RAG • AI Strategy</div>
        <div class="grand-total">{len(unique_businesses)}</div>
        <div class="grand-total-label">AI Companies & Consultants</div>
    </div>
    
    <div class="stats">
        <div class="stat-box">
            <div class="number">{len(by_region)}</div>
            <div class="label">Regions Covered</div>
        </div>
        <div class="stat-box">
            <div class="number">{len([b for b in unique_businesses if b.get('phone')])}</div>
            <div class="label">With Phone Numbers</div>
        </div>
        <div class="stat-box">
            <div class="number">{len([b for b in unique_businesses if b.get('website')])}</div>
            <div class="label">With Websites</div>
        </div>
        <div class="stat-box">
            <div class="number">{len(by_type)}</div>
            <div class="label">Business Categories</div>
        </div>
    </div>
    
    <nav class="nav">
        <div class="nav-inner">
            <a href="#by-type">📋 By Business Type</a>
            <a href="#by-region">🗺️ By Region</a>
            <a href="#south-florida">🌴 South Florida</a>
            <a href="#san-francisco">🌉 San Francisco</a>
            <a href="#denver">🏔️ Denver</a>
            <a href="#detroit">🏭 Detroit</a>
            <a href="#chicago">🌬️ Chicago</a>
            <a href="#saint-louis">🏛️ Saint Louis</a>
        </div>
    </nav>
    
    <div class="container">
        <!-- By Business Type Section -->
        <section id="by-type" class="section">
            <h2 class="section-title">📋 Companies by Business Type</h2>
'''

# Add companies by type
type_order = [
    "AI Consulting / Strategy",
    "AI / ML Development", 
    "Visual AI / Computer Vision",
    "RAG / LLM / NLP",
    "AI Infrastructure / MLOps",
    "AI Automation",
    "Data Science / Analytics"
]

for btype in type_order:
    if btype in by_type:
        companies = by_type[btype]
        html += f'''
            <h3 class="business-type-title">{btype} ({len(companies)} companies)</h3>
            <div class="companies-grid">
'''
        for c in companies[:50]:  # Limit to 50 per type
            phone = c.get('phone', '')
            website = c.get('website', '')
            rating = c.get('rating', '')
            address = c.get('scraped_address', '')
            region = c.get('region', '')
            
            html += f'''
                <div class="company-card">
                    <div class="company-name">{c.get('name', 'Unknown')}</div>
                    <div class="company-type">{btype}</div>
                    {f'<span class="rating">★ {rating}</span>' if rating else ''}
                    <div class="company-info"><strong>Region:</strong> {region}</div>
                    {f'<div class="company-info"><strong>Address:</strong> {address}</div>' if address else ''}
                    <div class="company-contact">
                        {f'<div class="company-info"><strong>📞 Phone:</strong> <span class="phone">{phone}</span></div>' if phone else ''}
                        {f'<div class="company-info"><strong>🌐 Website:</strong> <a href="{website}" class="website" target="_blank">{website[:50]}{"..." if len(website) > 50 else ""}</a></div>' if website else ''}
                    </div>
                </div>
'''
        html += '            </div>\n'

html += '''
        </section>
        
        <!-- By Region Section -->
        <section id="by-region" class="section">
            <h2 class="section-title">🗺️ Companies by Region</h2>
'''

# Add companies by region
for region in sorted(by_region.keys()):
    region_id = region.lower().replace(' ', '-').replace('/', '-')
    companies = by_region[region]
    html += f'''
            <h3 id="{region_id}" class="region-title">{region} ({len(companies)} companies)</h3>
            <div class="companies-grid">
'''
    for c in companies[:30]:  # Limit to 30 per region
        phone = c.get('phone', '')
        website = c.get('website', '')
        rating = c.get('rating', '')
        address = c.get('scraped_address', '')
        btype = c.get('business_type', '')
        
        html += f'''
                <div class="company-card">
                    <div class="company-name">{c.get('name', 'Unknown')}</div>
                    <div class="company-type">{btype}</div>
                    {f'<span class="rating">★ {rating}</span>' if rating else ''}
                    {f'<div class="company-info"><strong>Address:</strong> {address}</div>' if address else ''}
                    <div class="company-contact">
                        {f'<div class="company-info"><strong>📞 Phone:</strong> <span class="phone">{phone}</span></div>' if phone else ''}
                        {f'<div class="company-info"><strong>🌐 Website:</strong> <a href="{website}" class="website" target="_blank">{website[:50]}{"..." if len(website) > 50 else ""}</a></div>' if website else ''}
                    </div>
                </div>
'''
    html += '            </div>\n'

html += f'''
        </section>
    </div>
    
    <footer class="footer">
        <p>AI & Visual AI Consultants Directory</p>
        <p>Generated: <span class="date">{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</span></p>
        <p>Total Companies: {len(unique_businesses)} | Regions: {len(by_region)} | Categories: {len(by_type)}</p>
        <p style="margin-top: 20px; color: #555;">Filtered to include only AI/ML consultants, coaches, and agencies. Hardware/computer repair shops excluded.</p>
    </footer>
</body>
</html>
'''

# Write HTML file
with open('ai_consultants_directory_v2.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Generated ai_consultants_directory_v2.html")
print(f"Total unique AI companies: {len(unique_businesses)}")
print(f"\nBreakdown by Business Type:")
for btype in type_order:
    if btype in by_type:
        print(f"  {btype}: {len(by_type[btype])} companies")

print(f"\nBreakdown by Region:")
for region in sorted(by_region.keys()):
    print(f"  {region}: {len(by_region[region])} companies")

print(f"\nContact Info:")
print(f"  With phone numbers: {len([b for b in unique_businesses if b.get('phone')])}")
print(f"  With websites: {len([b for b in unique_businesses if b.get('website')])}")
