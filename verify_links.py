import re
import requests
from urllib.parse import urlparse
import sys

def check_links(file_path):
    print(f"Scanning {file_path} for links...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract hrefs and srcs
    links = re.findall(r'(?:href|src)=["\'](https?://[^"\']+)["\']', content)
    unique_links = sorted(list(set(links)))
    
    print(f"Found {len(unique_links)} unique links.")
    
    broken_links = []
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    for i, link in enumerate(unique_links):
        try:
            # Skip placeholder images as they are generated
            if "placehold.co" in link:
                continue
                
            print(f"[{i+1}/{len(unique_links)}] Checking: {link}")
            response = requests.head(link, headers=headers, timeout=10, allow_redirects=True)
            
            # If HEAD fails (some servers deny it), try GET
            if response.status_code >= 400:
                response = requests.get(link, headers=headers, timeout=10, stream=True)
                
            if response.status_code >= 400:
                print(f"  ❌ BROKEN ({response.status_code}): {link}")
                broken_links.append((link, response.status_code))
            else:
                print(f"  ✅ OK")
                
        except Exception as e:
            print(f"  ❌ ERROR: {link} - {str(e)}")
            broken_links.append((link, str(e)))

    print("\n--- Summary ---")
    if broken_links:
        print(f"Found {len(broken_links)} broken links:")
        for link, status in broken_links:
            print(f"{status}: {link}")
    else:
        print("All links verified successfully!")

if __name__ == "__main__":
    check_links("m:/code/vidismart/gemini.dash.html")
