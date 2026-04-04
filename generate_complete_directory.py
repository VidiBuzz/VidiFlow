#!/usr/bin/env python3
"""
Generate complete HTML directory with phone and website links
Updated: ONE BIG GRAND TOTAL NUMBER at top
"""

import json
import os
from datetime import datetime

# Load the scraped data
INPUT_FILE = "kratom_kava_complete_20260214_140628.json"
OUTPUT_HTML = "kratom_kava_complete_directory.html"
OUTPUT_TXT = "kratom_kava_complete_directory.txt"

with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

kava_bars = data.get('kava_bars', [])
kratom_vendors = data.get('kratom_vendors', [])

# Calculate totals
total_businesses = len(kava_bars) + len(kratom_vendors)
total_with_phone = sum(1 for b in kava_bars if b.get('phone')) + sum(1 for b in kratom_vendors if b.get('phone'))
total_with_website = sum(1 for b in kava_bars if b.get('website')) + sum(1 for b in kratom_vendors if b.get('website'))

# Sort by location
def get_location_key(bar):
    loc = bar.get('location', '') or bar.get('scraped_address', '') or bar.get('address', '')
    if 'South Florida' in loc or 'Fort Lauderdale' in loc or 'Miami' in loc or 'Hollywood' in loc or 'Davie' in loc:
        return '0_' + loc
    return '1_' + loc

kava_bars_sorted = sorted(kava_bars, key=get_location_key)
kratom_vendors_sorted = sorted(kratom_vendors, key=get_location_key)

# Generate HTML
html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Kratom & Kava Directory - South Florida & Beyond</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            color: #e0e0e0;
            line-height: 1.6;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        header {
            text-align: center;
            padding: 40px 20px;
            background: rgba(0,0,0,0.3);
            border-bottom: 3px solid #FFD700;
            margin-bottom: 30px;
        }
        h1 { 
            color: #FFD700;
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .subtitle { color: #a0a0a0; font-size: 1.1em; margin-bottom: 20px; }
        
        /* ONE BIG GRAND TOTAL */
        .grand-total-box {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            border-radius: 20px;
            padding: 40px;
            margin: 30px auto;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
        }
        .grand-total-label {
            color: #1a1a2e;
            font-size: 1.3em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        .grand-total-number {
            color: #1a1a2e;
            font-size: 6em;
            font-weight: 900;
            line-height: 1;
        }
        .grand-total-desc {
            color: #333;
            font-size: 1.1em;
            margin-top: 10px;
        }
        
        /* Breakdown section */
        .breakdown {
            background: rgba(0,0,0,0.2);
            border-radius: 15px;
            padding: 25px;
            margin: 20px auto;
            max-width: 800px;
            border: 1px solid rgba(255, 215, 0, 0.3);
        }
        .breakdown h3 {
            color: #FFD700;
            text-align: center;
            margin-bottom: 20px;
            font-size: 1.2em;
        }
        .breakdown-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
        }
        .breakdown-item {
            background: rgba(255,255,255,0.05);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }
        .breakdown-number {
            font-size: 1.8em;
            color: #FFD700;
            font-weight: bold;
        }
        .breakdown-label {
            color: #aaa;
            font-size: 0.85em;
            margin-top: 5px;
        }
        
        nav {
            position: sticky;
            top: 0;
            background: rgba(22, 33, 62, 0.95);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            z-index: 100;
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }
        nav a {
            color: #FFD700;
            text-decoration: none;
            padding: 10px 20px;
            border: 1px solid #FFD700;
            border-radius: 5px;
            transition: all 0.3s;
        }
        nav a:hover { background: #FFD700; color: #1a1a2e; }
        
        .section {
            background: rgba(0,0,0,0.2);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 215, 0, 0.3);
        }
        .section h2 {
            color: #FFD700;
            border-bottom: 2px solid #FFD700;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .business-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }
        .business-card {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s;
        }
        .business-card:hover {
            border-color: #FFD700;
            transform: translateY(-3px);
            box-shadow: 0 5px 20px rgba(255, 215, 0, 0.2);
        }
        .business-name {
            font-size: 1.2em;
            color: #fff;
            margin-bottom: 10px;
            font-weight: 600;
        }
        .business-address {
            color: #a0a0a0;
            font-size: 0.9em;
            margin-bottom: 10px;
        }
        .contact-info {
            margin-top: 15px;
        }
        .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            gap: 10px;
        }
        .contact-label {
            color: #888;
            min-width: 70px;
            font-size: 0.85em;
        }
        a.phone-link {
            color: #4CAF50;
            text-decoration: none;
            font-weight: 500;
        }
        a.phone-link:hover { text-decoration: underline; }
        a.website-link {
            color: #2196F3;
            text-decoration: none;
            word-break: break-all;
        }
        a.website-link:hover { text-decoration: underline; }
        a.maps-link {
            color: #FF9800;
            text-decoration: none;
            font-size: 0.9em;
        }
        a.maps-link:hover { text-decoration: underline; }
        
        .rating {
            display: inline-block;
            background: #FFD700;
            color: #1a1a2e;
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 0.85em;
            margin-left: 10px;
            font-weight: bold;
        }
        .social-links {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .social-link {
            display: inline-block;
            background: rgba(255,255,255,0.1);
            padding: 5px 12px;
            border-radius: 15px;
            margin-right: 8px;
            margin-bottom: 5px;
            font-size: 0.85em;
            color: #ccc;
            text-decoration: none;
        }
        .social-link:hover { background: rgba(255,255,255,0.2); }
        
        .missing {
            color: #666;
            font-style: italic;
        }
        
        footer {
            text-align: center;
            padding: 30px;
            color: #666;
            border-top: 1px solid rgba(255,255,255,0.1);
            margin-top: 40px;
        }
        
        @media (max-width: 768px) {
            .business-grid { grid-template-columns: 1fr; }
            h1 { font-size: 1.8em; }
            .grand-total-number { font-size: 4em; }
            .breakdown-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Complete Kratom & Kava Directory</h1>
            <p class="subtitle">South Florida & Beyond - Comprehensive Business Listings with Contact Information</p>
            <p style="color: #888; font-size: 0.9em;">Generated: ''' + datetime.now().strftime('%B %d, %Y at %I:%M %p') + '''</p>
        </header>
        
        <!-- ONE BIG GRAND TOTAL -->
        <div class="grand-total-box">
            <div class="grand-total-label">TOTAL ADDRESSABLE MARKET</div>
            <div class="grand-total-number">''' + str(total_businesses) + '''</div>
            <div class="grand-total-desc">Total Kratom & Kava Businesses to Contact</div>
        </div>
        
        <!-- BREAKDOWN -->
        <div class="breakdown">
            <h3>Breakdown by Category</h3>
            <div class="breakdown-grid">
                <div class="breakdown-item">
                    <div class="breakdown-number">''' + str(len(kava_bars)) + '''</div>
                    <div class="breakdown-label">Kava Bars</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-number">''' + str(len(kratom_vendors)) + '''</div>
                    <div class="breakdown-label">Kratom Vendors</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-number">''' + str(total_with_phone) + '''</div>
                    <div class="breakdown-label">Have Phone Numbers</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-number">''' + str(total_with_website) + '''</div>
                    <div class="breakdown-label">Have Websites</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-number">''' + str(sum(1 for b in kava_bars if b.get('phone'))) + '''</div>
                    <div class="breakdown-label">Kava Bars with Phone</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-number">''' + str(sum(1 for b in kava_bars if b.get('website'))) + '''</div>
                    <div class="breakdown-label">Kava Bars with Website</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-number">''' + str(sum(1 for b in kratom_vendors if b.get('phone'))) + '''</div>
                    <div class="breakdown-label">Kratom Vendors with Phone</div>
                </div>
                <div class="breakdown-item">
                    <div class="breakdown-number">''' + str(sum(1 for b in kratom_vendors if b.get('website'))) + '''</div>
                    <div class="breakdown-label">Kratom Vendors with Website</div>
                </div>
            </div>
        </div>
        
        <nav>
            <a href="#kava-bars">Kava Bars (''' + str(len(kava_bars)) + ''')</a>
            <a href="#kratom-vendors">Kratom Vendors (''' + str(len(kratom_vendors)) + ''')</a>
        </nav>
        
        <section id="kava-bars" class="section">
            <h2>Kava Bars (''' + str(len(kava_bars)) + ''' locations)</h2>
            <div class="business-grid">
'''

# Add kava bars
for bar in kava_bars_sorted:
    name = bar.get('name', 'Unknown')
    address = bar.get('scraped_address') or bar.get('address') or bar.get('location', 'Address not available')
    phone = bar.get('phone')
    website = bar.get('website')
    rating = bar.get('rating')
    maps_url = bar.get('google_maps_url') or bar.get('link', '')
    social_links = bar.get('social_links', [])
    
    html += f'''
                <div class="business-card">
                    <div class="business-name">{name}'''
    if rating:
        html += f'<span class="rating">{"{:.1f}".format(float(rating)) if rating else ""} stars</span>'
    html += '''</div>
                    <div class="business-address">''' + address + '''</div>
                    <div class="contact-info">
                        <div class="contact-item">
                            <span class="contact-label">Phone:</span>'''
    if phone:
        html += f'<a href="tel:{phone}" class="phone-link">{phone}</a>'
    else:
        html += '<span class="missing">Not available</span>'
    html += '''</div>
                        <div class="contact-item">
                            <span class="contact-label">Website:</span>'''
    if website:
        html += f'<a href="{website}" target="_blank" class="website-link">{website}</a>'
    else:
        html += '<span class="missing">Not available</span>'
    html += '''</div>'''
    if maps_url:
        html += f'''
                        <div class="contact-item">
                            <span class="contact-label">Maps:</span>
                            <a href="{maps_url}" target="_blank" class="maps-link">View on Google Maps</a>
                        </div>'''
    if social_links:
        html += '''
                        <div class="social-links">'''
        for social in social_links[:3]:  # Limit to 3 social links
            html += f'<a href="{social["url"]}" target="_blank" class="social-link">{social["platform"]}</a>'
        html += '''</div>'''
    html += '''
                    </div>
                </div>'''

html += '''
            </div>
        </section>
        
        <section id="kratom-vendors" class="section">
            <h2>Kratom Vendors (''' + str(len(kratom_vendors)) + ''' locations)</h2>
            <div class="business-grid">
'''

# Add kratom vendors
for vendor in kratom_vendors_sorted:
    name = vendor.get('name', 'Unknown')
    address = vendor.get('scraped_address') or vendor.get('address') or vendor.get('location', 'Address not available')
    phone = vendor.get('phone')
    website = vendor.get('website')
    rating = vendor.get('rating')
    maps_url = vendor.get('google_maps_url') or vendor.get('link', '')
    social_links = vendor.get('social_links', [])
    
    html += f'''
                <div class="business-card">
                    <div class="business-name">{name}'''
    if rating:
        html += f'<span class="rating">{"{:.1f}".format(float(rating)) if rating else ""} stars</span>'
    html += '''</div>
                    <div class="business-address">''' + address + '''</div>
                    <div class="contact-info">
                        <div class="contact-item">
                            <span class="contact-label">Phone:</span>'''
    if phone:
        html += f'<a href="tel:{phone}" class="phone-link">{phone}</a>'
    else:
        html += '<span class="missing">Not available</span>'
    html += '''</div>
                        <div class="contact-item">
                            <span class="contact-label">Website:</span>'''
    if website:
        html += f'<a href="{website}" target="_blank" class="website-link">{website}</a>'
    else:
        html += '<span class="missing">Not available</span>'
    html += '''</div>'''
    if maps_url:
        html += f'''
                        <div class="contact-item">
                            <span class="contact-label">Maps:</span>
                            <a href="{maps_url}" target="_blank" class="maps-link">View on Google Maps</a>
                        </div>'''
    if social_links:
        html += '''
                        <div class="social-links">'''
        for social in social_links[:3]:
            html += f'<a href="{social["url"]}" target="_blank" class="social-link">{social["platform"]}</a>'
        html += '''</div>'''
    html += '''
                    </div>
                </div>'''

html += '''
            </div>
        </section>
        
        <footer>
            <p>This directory was automatically generated from Google Maps business listings.</p>
            <p>Contact information is sourced from Google Business Profiles. Email addresses are typically not listed publicly.</p>
            <p>Please contact businesses directly via phone or website for email inquiries.</p>
        </footer>
    </div>
</body>
</html>
'''

# Write HTML file
with open(OUTPUT_HTML, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"HTML directory created: {OUTPUT_HTML}")

# Generate plain text version
txt = f"""
{'='*80}
COMPLETE KRATOM & KAVA DIRECTORY
South Florida & Beyond
Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
{'='*80}

{'='*80}
TOTAL ADDRESSABLE MARKET: {total_businesses} BUSINESSES
{'='*80}

If you called every single company on this list, you would be calling {total_businesses} businesses.

BREAKDOWN BY CATEGORY:
{'='*80}
Kava Bars: {len(kava_bars)}
Kratom Vendors: {len(kratom_vendors)}
Have Phone Numbers: {total_with_phone}
Have Websites: {total_with_website}

Kava Bars with Phone: {sum(1 for b in kava_bars if b.get('phone'))}
Kava Bars with Website: {sum(1 for b in kava_bars if b.get('website'))}
Kratom Vendors with Phone: {sum(1 for b in kratom_vendors if b.get('phone'))}
Kratom Vendors with Website: {sum(1 for b in kratom_vendors if b.get('website'))}

{'='*80}
KAVA BARS ({len(kava_bars)} locations)
{'='*80}

"""

for bar in kava_bars_sorted:
    name = bar.get('name', 'Unknown')
    address = bar.get('scraped_address') or bar.get('address') or bar.get('location', 'N/A')
    phone = bar.get('phone', 'N/A')
    website = bar.get('website', 'N/A')
    rating = bar.get('rating', 'N/A')
    maps_url = bar.get('google_maps_url') or bar.get('link', 'N/A')
    
    txt += f"""
{name}
{'-'*60}
Address: {address}
Phone: {phone}
Website: {website}
Rating: {rating} stars
Google Maps: {maps_url}

"""

txt += f"""
{'='*80}
KRATOM VENDORS ({len(kratom_vendors)} locations)
{'='*80}

"""

for vendor in kratom_vendors_sorted:
    name = vendor.get('name', 'Unknown')
    address = vendor.get('scraped_address') or vendor.get('address') or vendor.get('location', 'N/A')
    phone = vendor.get('phone', 'N/A')
    website = vendor.get('website', 'N/A')
    rating = vendor.get('rating', 'N/A')
    maps_url = vendor.get('google_maps_url') or vendor.get('link', 'N/A')
    
    txt += f"""
{name}
{'-'*60}
Address: {address}
Phone: {phone}
Website: {website}
Rating: {rating} stars
Google Maps: {maps_url}

"""

txt += """
NOTES:
- Email addresses are typically not displayed on Google Business Profiles
- Contact businesses directly via phone or website for email inquiries
- All data sourced from Google Maps business listings
"""

with open(OUTPUT_TXT, 'w', encoding='utf-8') as f:
    f.write(txt)

print(f"Text directory created: {OUTPUT_TXT}")
print("\nDone!")