#!/usr/bin/env python3
"""
Generate Optimized AI Directory HTML with Pagination
Smaller file size, lazy loading, better performance
"""

import json
from datetime import datetime

# Load data
INPUT_FILE = "ai_visual_rag_companies_20260214_165715.json"

with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

businesses = data.get('businesses', [])

# Calculate totals
total_businesses = len(businesses)
total_with_phone = sum(1 for b in businesses if b.get('phone'))
total_with_website = sum(1 for b in businesses if b.get('website'))

# Group by region
regions = {}
for b in businesses:
    region = b.get('region', 'Unknown')
    if region not in regions:
        regions[region] = []
    regions[region].append(b)

region_order = ['South Florida', 'San Francisco CA', 'Denver CO', 'Detroit MI', 'Chicago IL', 'Saint Louis MO', 'Cleveland OH', 'Bentonville AR']

# Generate main HTML with JavaScript for dynamic loading
html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI & Visual AI Consulting Directory - 1131 Companies</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            color: #e0e0e0;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        
        header {
            text-align: center;
            padding: 30px 20px;
            background: rgba(0,0,0,0.3);
            border-bottom: 3px solid #FFD700;
            margin-bottom: 20px;
        }
        h1 { color: #FFD700; font-size: 2em; margin-bottom: 10px; }
        .subtitle { color: #a0a0a0; font-size: 1em; }
        
        .grand-total-box {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            border-radius: 15px;
            padding: 30px;
            margin: 20px auto;
            max-width: 500px;
            text-align: center;
        }
        .grand-total-label { color: #1a1a2e; font-size: 1em; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; }
        .grand-total-number { color: #1a1a2e; font-size: 5em; font-weight: 900; line-height: 1; }
        .grand-total-desc { color: #333; font-size: 1em; margin-top: 10px; }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin: 20px 0;
        }
        .stat-box {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
        }
        .stat-number { font-size: 1.8em; color: #FFD700; font-weight: bold; }
        .stat-label { color: #aaa; font-size: 0.8em; }
        
        nav {
            position: sticky;
            top: 0;
            background: rgba(22, 33, 62, 0.98);
            padding: 10px;
            border-radius: 10px;
            margin-bottom: 20px;
            z-index: 100;
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        nav button {
            background: transparent;
            color: #FFD700;
            border: 1px solid #FFD700;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s;
        }
        nav button:hover, nav button.active { background: #FFD700; color: #1a1a2e; }
        
        .search-box {
            text-align: center;
            margin: 20px 0;
        }
        .search-box input {
            width: 100%;
            max-width: 500px;
            padding: 12px 20px;
            border-radius: 25px;
            border: 2px solid #FFD700;
            background: rgba(0,0,0,0.3);
            color: #fff;
            font-size: 1em;
        }
        .search-box input::placeholder { color: #888; }
        .search-box input:focus { outline: none; box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
        
        .business-list {
            display: grid;
            gap: 15px;
        }
        .business-card {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            padding: 15px;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s;
        }
        .business-card:hover { border-color: #FFD700; }
        .business-name { font-size: 1.1em; color: #fff; font-weight: 600; margin-bottom: 5px; }
        .business-category { 
            display: inline-block;
            background: rgba(255, 215, 0, 0.2);
            color: #FFD700;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.75em;
            margin-left: 8px;
        }
        .business-address { color: #888; font-size: 0.85em; margin-bottom: 10px; }
        .contact-row { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 10px; }
        .contact-item { font-size: 0.9em; }
        .contact-item a { text-decoration: none; }
        .contact-item a.phone { color: #4CAF50; }
        .contact-item a.website { color: #2196F3; }
        .contact-item a.maps { color: #FF9800; font-size: 0.85em; }
        .missing { color: #666; font-style: italic; font-size: 0.85em; }
        
        .load-more {
            text-align: center;
            margin: 20px 0;
        }
        .load-more button {
            background: #FFD700;
            color: #1a1a2e;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .load-more button:hover { transform: scale(1.05); }
        
        .showing-info {
            text-align: center;
            color: #888;
            margin: 10px 0;
        }
        
        footer {
            text-align: center;
            padding: 20px;
            color: #666;
            border-top: 1px solid rgba(255,255,255,0.1);
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>AI & Visual AI Consulting Directory</h1>
            <p class="subtitle">Complete Company Listings - AI, RAG, Visual AI, On-Premise Solutions</p>
        </header>
        
        <div class="grand-total-box">
            <div class="grand-total-label">TOTAL ADDRESSABLE MARKET</div>
            <div class="grand-total-number">''' + str(total_businesses) + '''</div>
            <div class="grand-total-desc">AI & Visual AI Consulting Companies</div>
        </div>
        
        <div class="stats-grid">
'''

for region in region_order:
    if region in regions:
        html += f'''            <div class="stat-box">
                <div class="stat-number">{len(regions[region])}</div>
                <div class="stat-label">{region}</div>
            </div>
'''

html += f'''            <div class="stat-box">
                <div class="stat-number">{total_with_phone}</div>
                <div class="stat-label">Have Phone Numbers</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">{total_with_website}</div>
                <div class="stat-label">Have Websites</div>
            </div>
        </div>
        
        <div class="search-box">
            <input type="text" id="searchInput" placeholder="Search companies by name, city, or category..." onkeyup="filterBusinesses()">
        </div>
        
        <nav>
            <button class="active" onclick="showRegion('all')">All (''' + str(total_businesses) + ''')</button>
'''

for region in region_order:
    if region in regions:
        html += f'''            <button onclick="showRegion('{region}')">{region} ({len(regions[region])})</button>
'''

html += '''        </nav>
        
        <div class="showing-info" id="showingInfo">Showing 1-50 of ''' + str(total_businesses) + ''' companies</div>
        
        <div class="business-list" id="businessList">
            <!-- Businesses loaded dynamically -->
        </div>
        
        <div class="load-more">
            <button onclick="loadMore()" id="loadMoreBtn">Load More</button>
        </div>
        
        <footer>
            <p>Generated: ''' + datetime.now().strftime('%B %d, %Y') + '''</p>
            <p>Contact businesses directly via phone or website for email inquiries.</p>
        </footer>
    </div>
    
    <script>
        // Business data
        const businesses = [
'''

# Add business data as JSON
for i, b in enumerate(businesses):
    name = b.get('name', 'Unknown').replace("'", "\\'").replace('"', '\\"')
    address = str(b.get('scraped_address') or b.get('address') or b.get('location', '')).replace("'", "\\'").replace('"', '\\"')
    phone = b.get('phone', '')
    website = b.get('website', '')
    category = b.get('category', '').replace("'", "\\'").replace('"', '\\"')
    region = b.get('region', 'Unknown')
    maps_url = b.get('google_maps_url') or b.get('link', '')
    
    html += f'''            {{
                name: "{name}",
                address: "{address}",
                phone: "{phone}",
                website: "{website}",
                category: "{category}",
                region: "{region}",
                maps: "{maps_url}"
            }}{',' if i < len(businesses) - 1 else ''}
'''

html += '''        ];
        
        let currentRegion = 'all';
        let currentIndex = 0;
        const perPage = 50;
        let filteredBusinesses = [...businesses];
        
        function renderBusinesses(start, end) {
            const list = document.getElementById('businessList');
            const toShow = filteredBusinesses.slice(start, end);
            
            toShow.forEach(b => {
                const card = document.createElement('div');
                card.className = 'business-card';
                card.setAttribute('data-region', b.region);
                
                let phoneHtml = b.phone ? `<a href="tel:${b.phone}" class="phone">${b.phone}</a>` : '<span class="missing">No phone</span>';
                let websiteHtml = b.website ? `<a href="${b.website}" target="_blank" class="website">${b.website.length > 40 ? b.website.substring(0, 40) + '...' : b.website}</a>` : '<span class="missing">No website</span>';
                let mapsHtml = b.maps ? `<a href="${b.maps}" target="_blank" class="maps">Map</a>` : '';
                let categoryHtml = b.category ? `<span class="business-category">${b.category}</span>` : '';
                
                card.innerHTML = `
                    <div class="business-name">${b.name}${categoryHtml}</div>
                    <div class="business-address">${b.address}</div>
                    <div class="contact-row">
                        <div class="contact-item">📞 ${phoneHtml}</div>
                        <div class="contact-item">🌐 ${websiteHtml}</div>
                        ${mapsHtml ? `<div class="contact-item">📍 ${mapsHtml}</div>` : ''}
                    </div>
                `;
                
                list.appendChild(card);
            });
            
            updateShowingInfo();
        }
        
        function updateShowingInfo() {
            const info = document.getElementById('showingInfo');
            const showing = Math.min(currentIndex + perPage, filteredBusinesses.length);
            info.textContent = `Showing 1-${showing} of ${filteredBusinesses.length} companies`;
            
            const btn = document.getElementById('loadMoreBtn');
            btn.style.display = showing >= filteredBusinesses.length ? 'none' : 'inline-block';
        }
        
        function loadMore() {
            currentIndex += perPage;
            renderBusinesses(currentIndex, currentIndex + perPage);
        }
        
        function showRegion(region) {
            currentRegion = region;
            currentIndex = 0;
            
            // Update active button
            document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Filter businesses
            if (region === 'all') {
                filteredBusinesses = [...businesses];
            } else {
                filteredBusinesses = businesses.filter(b => b.region === region);
            }
            
            // Clear and re-render
            document.getElementById('businessList').innerHTML = '';
            renderBusinesses(0, perPage);
        }
        
        function filterBusinesses() {
            const search = document.getElementById('searchInput').value.toLowerCase();
            currentIndex = 0;
            
            filteredBusinesses = businesses.filter(b => {
                const matchesRegion = currentRegion === 'all' || b.region === currentRegion;
                const matchesSearch = !search || 
                    b.name.toLowerCase().includes(search) ||
                    b.address.toLowerCase().includes(search) ||
                    b.category.toLowerCase().includes(search);
                return matchesRegion && matchesSearch;
            });
            
            document.getElementById('businessList').innerHTML = '';
            renderBusinesses(0, perPage);
        }
        
        // Initial load
        renderBusinesses(0, perPage);
    </script>
</body>
</html>
'''

# Write optimized HTML
output_file = "ai_visual_rag_directory.html"
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Optimized HTML created: {output_file}")
print(f"Total businesses: {total_businesses}")
print("Features: Search, Region filtering, Lazy loading (50 per page)")