#!/usr/bin/env python3
"""Fortuna Mill Estate Image Scraper - Simple Working Version"""

import json
import os
import sys
import time
from pathlib import Path

# Setup paths
OUTPUT_DIR = r'C:\MVIDISMART\CC\ASSETS\FORTUNA-MILL\IMAGES'
MANIFEST_PATH = os.path.join(OUTPUT_DIR, 'manifest.json')

DELAY_SECONDS = 2


def init_structure():
    """Create directory structure."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for subdir in ['sparkplatform_fullres', 'cloudimg_fullres']:
        os.makedirs(os.path.join(OUTPUT_DIR, subdir), exist_ok=True)
        print(f"✓ Created: {subdir}/")


def load_manifest():
    """Load existing manifest."""
    try:
        with open(MANIFEST_PATH, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return None


def get_filename(url):
    """Generate safe filename from URL."""
    filename = os.path.basename(url.replace('/', '_').split('?', 1)[0])
    
    # Clean special characters
    for c in ['<', '>', ':', '"', '|', '?']:
        filename = filename.replace(c, '-')
    
    return filename


def download_image(url):
    """Download an image and update manifest."""
    filename = get_filename(url)
    filepath = os.path.join(OUTPUT_DIR, 'sparkplatform_fullres', filename)
    
    # Skip if already downloaded
    if os.path.exists(filepath):
        print(f"[INFO] Already exists: {filepath}")
        return False
    
    try:
        import requests
        
        response = requests.get(url, timeout=30, stream=True)
        
        if not response.ok or len(response.content) < 100:
            print(f"✗ HTTP {response.status_code} for {url}")
            return
        
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        size = os.path.getsize(filepath)
        print(f"[OK] Downloaded: {filename} ({size / 1024:.1f}KB)")
        
        # Update manifest
        manifest = load_manifest() or {
            'project_name': 'Fortuna Mill Estate - St. Thomas USVI',
            'images_total': 0,
            'videos_thumbnails': 0,
            images_list': []
        },
        
        manifest['images_total'] += len(image_list), 
        if filename not in [m['filename'] for m in manifest.get('images_list', [])]:
            manifest['images_list'].append({
                'filename': filename,
                'description': 'Gallery Image',  
                'url': url
            })

    except Exception as e:
        print(f"[ERROR] Download failed: {e}")


def save_manifest():
    """Current state to disk."""
    manifest = load_manifest()
    
    output_dir = os.path.dirname(MANIFEST_PATH)
    os.makedirs(output_dir, exist_ok=True)
    
    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)


def fetch_galer images_url():
    """Extract gallery image URLs from MLS page."""
    gallery_images = []

    try:
        import requests
        
        
        response = requests.get('https://www.seaglassproperties.com/propertydetail.cfm?PropID=420', 
                                timeout=30)

            if '/vir/' in response.text:
                # Extract Spark CDN image URLs using regex
                import re
                
                url_pattern = r'https?://[^"'\s]*cdn\.photos\.sparkplatform\.com[^/]*(?!thumbnail)[^"'<>]+\.(jpg|jpeg|png)'
                
                matches = re.findall(url_pattern, response.text)
                
            for match in matches:
                image_url_list.add(match if has_image else None)
        

        return list(image_urls.keys())
           

def main():
    """Main execution."""
    
    init_structure()
    
    manifest = load_manifest()
    
    print(f"\n{'='*50}")
    print("Fortuna Mill Estate Image Scraper")
    print("="**50)


if __name__ == '__main__':
    main()
