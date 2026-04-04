
import os
import re

# === CONFIGURATION ===
BASE_DIR = r"m:\code\vidismart"
FILES_TO_CHECK = [
    "vidismart.masterlist.html",
    "master-index.html",
    "smartchannelcx.tech.html",
    "smartchannelcx.html",
    "vidismart-competitive-analysis-2026.html",
    "viditwin.html",
    "vidishop.html",
    # "SmartGenUi.html", # Optional, check if exists
    "gemini.dash.html"
]

# Source of Truth: Keyword in Label -> Expected URL
# We use partial matching on the Label to identify the intent.
NAV_RULES = {
    "Smart Stack": "vidismart.masterlist.html",
    "VidiMail": "vidismart-competitive-analysis-2026.html",
    "SmartChannel": ["smartchannelcx.html", "smartchannelcx-tech.html"], # Can be either depending on context, but shouldn't be random
    "VidiTwin": "viditwin.html",
    "VidiShop": "vidishop.html",
    "AI Gen": "SmartGenUi.html",
    "SmartGen": "SmartGenUi.html"
}

# Specific exact matches we want to enforce for the "Main Menu" items
# (Label, Expected URL)
STRICT_MENU_ITEMS = [
    ("Smart Stack", "vidismart.masterlist.html"),
    ("VidiMail", "vidismart-competitive-analysis-2026.html"),
    ("VidiShop", "vidishop.html"),
    ("VidiTwin", "viditwin.html"),
    ("AI Gen", "SmartGenUi.html"),
    ("SmartGen AI", "SmartGenUi.html")
]

def check_file(filename):
    file_path = os.path.join(BASE_DIR, filename)
    if not os.path.exists(file_path):
        print(f"❌ File not found: {filename}")
        return

    print(f"\n🔍 Checking: {filename}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"   ⚠️ Could not read file: {e}")
        return

    # 1. Check for Duplicate Headers (Universal Nav vs Dynamic/Custom)
    if '<header class="vidi-universal-nav">' in content and 'vidi-glass-nav' in content:
        print(f"   ⚠️ WARNING: Possible Duplicate Navigation detected (Universal + Glass Nav).")

    # 2. Extract Links using Regex (Simple "href" extractor)
    # Looking for <a href="...">...Label...</a> patterns roughly
    # We focus on the "Premium" or "Glass" nav structure usually found in these files
    
    # Strategy: Find specific link text and see where it goes.
    
    issues_found = 0
    
    for label, expected_url in STRICT_MENU_ITEMS:
        # Regex to find an anchor tag containing the label
        # Matches: <a ... > ... Label ... </a>
        # This is a bit loose but effective for text search
        # We capture the HREF
        
        # Pattern: <a [^>]*href=["']([^"']+)["'][^>]*>.*?Label.*?</a>
        # We need to be careful about newlines and spaces
        pattern = re.compile(r'<a\s+(?:[^>]*?\s+)?href=["\']([^"\']+)["\'][^>]*>[\s\S]*?{}.*?</a>'.format(re.escape(label)), re.IGNORECASE)
        
        matches = pattern.findall(content)
        
        if not matches:
            # Maybe it's not in this specific file's menu, which is fine, 
            # but if it IS there, it better be right.
            # print(f"   ℹ️  '{label}' link not found/parsed.")
            continue
            
        for url in matches:
            # Clean URL (remove ./ or leading / if needed for comparison, strictly we expect relative)
            clean_url = url.strip()
            
            # Special handling for SmartChannel which has two valid targets
            is_valid = False
            if isinstance(expected_url, list):
                if clean_url in expected_url:
                    is_valid = True
            else:
                if clean_url == expected_url:
                    is_valid = True
                    
            if not is_valid:
                print(f"   ❌ BROKEN LINK: '{label}' -> points to '{clean_url}' (Expected: '{expected_url}')")
                issues_found += 1
            else:
                # print(f"   ✅ '{label}' -> '{clean_url}'")
                pass

    if issues_found == 0:
        print("   ✅ Navigation looks logical.")

if __name__ == "__main__":
    print("🚀 Starting Navigation Audit Agent...")
    for f in FILES_TO_CHECK:
        check_file(f)
    print("\n🏁 Audit Complete.")
