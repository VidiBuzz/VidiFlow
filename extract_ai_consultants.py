#!/usr/bin/env python3
"""
Extract AI Consultants data from ai_consultants_directory_v3.html
and convert to structured JSON/SQL format for database import.
"""

from bs4 import BeautifulSoup
import json
import re
from datetime import datetime

def extract_consultants():
    """Extract consultant data from HTML file."""
    
    with open('ai_consultants_directory_v3.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    consultants = []
    consultant_id = 1
    
    # Find all company cards
    company_cards = soup.find_all('div', class_='company-card')
    
    print(f"Found {len(company_cards)} company cards")
    
    for card in company_cards:
        try:
            # Extract company name
            name_elem = card.find('div', class_='company-name')
            name = name_elem.text.strip() if name_elem else None
            
            # Extract business type
            type_elem = card.find('div', class_='company-type')
            business_type = type_elem.text.strip() if type_elem else None
            
            # Extract rating
            rating_elem = card.find('span', class_='rating')
            rating = None
            if rating_elem:
                rating_text = rating_elem.text.replace('*', '').strip()
                try:
                    rating = float(rating_text)
                except:
                    rating = None
            
            # Extract description
            desc_elem = card.find('div', class_='company-description')
            description = desc_elem.text.strip() if desc_elem else None
            
            # Extract region from company-info
            region = None
            address = None
            phone = None
            website = None
            
            info_divs = card.find_all('div', class_='company-info')
            for info in info_divs:
                text = info.get_text()
                if 'Region:' in text:
                    region = text.replace('Region:', '').strip()
                elif 'Address:' in text:
                    address = text.replace('Address:', '').strip()
                elif 'Phone:' in text:
                    phone_span = info.find('span', class_='phone')
                    if phone_span:
                        phone = phone_span.text.strip()
                elif 'Website:' in text:
                    link = info.find('a', class_='website')
                    if link:
                        website = link.get('href', '').strip()
            
            # Only add if we have at least a name
            if name:
                consultant = {
                    'id': consultant_id,
                    'name': name,
                    'business_type': business_type,
                    'rating': rating,
                    'description': description,
                    'region': region,
                    'address': address,
                    'phone': phone,
                    'website': website,
                    'created_at': datetime.now().isoformat()
                }
                consultants.append(consultant)
                consultant_id += 1
                
                if consultant_id % 50 == 0:
                    print(f"Processed {consultant_id} consultants...")
                    
        except Exception as e:
            print(f"Error processing card: {e}")
            continue
    
    return consultants

def generate_sql(consultants):
    """Generate SQL INSERT statements."""
    
    sql = """-- AI Consultants Database Schema and Seed Data
-- Generated: {timestamp}
-- Total Consultants: {count}

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create business_types enum
DO $$ BEGIN
    CREATE TYPE business_type AS ENUM (
        'AI Consulting / Strategy',
        'AI / ML Development',
        'Visual AI / Computer Vision',
        'RAG / LLM / NLP',
        'AI Infrastructure / MLOps',
        'AI Automation',
        'Data Science / Analytics'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create regions enum
DO $$ BEGIN
    CREATE TYPE region_type AS ENUM (
        'South Florida',
        'San Francisco CA',
        'Denver CO',
        'Detroit MI',
        'Chicago IL',
        'Cleveland OH',
        'Saint Louis MO',
        'Bentonville AR'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create consultants table
CREATE TABLE IF NOT EXISTS ai_consultants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    rating DECIMAL(2,1),
    description TEXT,
    region VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    website VARCHAR(500),
    logo_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consultants_business_type ON ai_consultants(business_type);
CREATE INDEX IF NOT EXISTS idx_consultants_region ON ai_consultants(region);
CREATE INDEX IF NOT EXISTS idx_consultants_rating ON ai_consultants(rating);
CREATE INDEX IF NOT EXISTS idx_consultants_featured ON ai_consultants(is_featured) WHERE is_featured = true;

-- Enable Row Level Security
ALTER TABLE ai_consultants ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Public can read consultants" ON ai_consultants;
CREATE POLICY "Public can read consultants" ON ai_consultants
    FOR SELECT USING (true);

-- Insert consultants
""".format(timestamp=datetime.now().isoformat(), count=len(consultants))

    # Generate INSERT statements
    for c in consultants:
        # Escape single quotes
        name = c['name'].replace("'", "''") if c['name'] else ''
        description = c['description'].replace("'", "''") if c['description'] else ''
        address = c['address'].replace("'", "''") if c['address'] else ''
        
        sql += f"""INSERT INTO ai_consultants (name, business_type, rating, description, region, address, phone, website)
VALUES ('{name}', '{c['business_type'] or ''}', {c['rating'] or 'NULL'}, '{description}', '{c['region'] or ''}', '{address}', '{c['phone'] or ''}', '{c['website'] or ''}');
"""
    
    return sql

def generate_json(consultants):
    """Generate JSON file for API usage."""
    return {
        'metadata': {
            'total': len(consultants),
            'generated_at': datetime.now().isoformat(),
            'version': '1.0'
        },
        'consultants': consultants
    }

def generate_static_data(consultants):
    """Generate TypeScript static data for fallback."""
    
    # Get unique business types and regions
    business_types = sorted(list(set(c['business_type'] for c in consultants if c['business_type'])))
    regions = sorted(list(set(c['region'] for c in consultants if c['region'])))
    
    ts_content = f"""// AI Consultants Static Data
// Generated: {datetime.now().isoformat()}
// This file serves as fallback when API is unavailable

export interface Consultant {{
  id: string;
  name: string;
  business_type: string;
  rating: number | null;
  description: string | null;
  region: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
}}

export const businessTypes = {json.dumps(business_types, indent=2)};

export const regions = {json.dumps(regions, indent=2)};

export const consultants: Consultant[] = [
"""
    
    # Add first 50 consultants to static data (to keep file size reasonable)
    for c in consultants[:50]:
        ts_content += f"""  {{
    id: "{c['id']}",
    name: "{c['name'].replace('"', '\\"')}",
    business_type: "{c['business_type'] or ''}",
    rating: {c['rating'] if c['rating'] else 'null'},
    description: {json.dumps(c['description']) if c['description'] else 'null'},
    region: "{c['region'] or ''}",
    address: {json.dumps(c['address']) if c['address'] else 'null'},
    phone: {json.dumps(c['phone']) if c['phone'] else 'null'},
    website: {json.dumps(c['website']) if c['website'] else 'null'},
    logo_url: null
  }},
"""
    
    ts_content += """];

export const consultantsByType: Record<string, Consultant[]> = businessTypes.reduce((acc, type) => {{
  acc[type] = consultants.filter(c => c.business_type === type);
  return acc;
}}, {{}} as Record<string, Consultant[]>);

export const consultantsByRegion: Record<string, Consultant[]> = regions.reduce((acc, region) => {{
  acc[region] = consultants.filter(c => c.region === region);
  return acc;
}}, {{}} as Record<string, Consultant[]>);
"""
    
    return ts_content

def main():
    print("Extracting AI Consultants from HTML...")
    
    # Extract data
    consultants = extract_consultants()
    print(f"\nExtracted {len(consultants)} consultants")
    
    # Generate outputs
    print("\nGenerating output files...")
    
    # 1. JSON file
    json_data = generate_json(consultants)
    with open('ai_consultants_data.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)
    print("  - ai_consultants_data.json")
    
    # 2. SQL file
    sql = generate_sql(consultants)
    with open('ai_consultants_seed.sql', 'w', encoding='utf-8') as f:
        f.write(sql)
    print("  - ai_consultants_seed.sql")
    
    # 3. TypeScript static data
    ts = generate_static_data(consultants)
    with open('ai_consultants_static.ts', 'w', encoding='utf-8') as f:
        f.write(ts)
    print("  - ai_consultants_static.ts")
    
    # Print summary
    print("\nSummary:")
    print(f"  Total Consultants: {len(consultants)}")
    
    # Count by business type
    types = {}
    regions = {}
    for c in consultants:
        bt = c['business_type'] or 'Unknown'
        r = c['region'] or 'Unknown'
        types[bt] = types.get(bt, 0) + 1
        regions[r] = regions.get(r, 0) + 1
    
    print("\n  By Business Type:")
    for bt, count in sorted(types.items()):
        print(f"    - {bt}: {count}")
    
    print("\n  By Region:")
    for r, count in sorted(regions.items()):
        print(f"    - {r}: {count}")
    
    print("\nDone! Files generated successfully.")

if __name__ == "__main__":
    main()
