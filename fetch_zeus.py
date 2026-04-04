import requests
from bs4 import BeautifulSoup
import sys
import io
import gzip

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

url = 'https://www.zeusconsultingservices.com/'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
}

resp = requests.get(url, headers=headers, timeout=15)
print('Status:', resp.status_code)
print('Content-Type:', resp.headers.get('Content-Type', 'unknown'))
print('Content-Encoding:', resp.headers.get('Content-Encoding', 'none'))

# Let requests handle decompression automatically
text = resp.text
print('Text length:', len(text))

soup = BeautifulSoup(text, 'html.parser')

# Get title
print('Title:', soup.title.string if soup.title else 'None')

# Get meta description
meta = soup.find('meta', attrs={'name': 'description'})
if meta:
    print('Meta desc:', meta.get('content', '')[:300])

# Get OG description
og = soup.find('meta', attrs={'property': 'og:description'})
if og:
    print('OG desc:', og.get('content', '')[:300])

# Get all text
all_text = soup.get_text(strip=True)
print('All text length:', len(all_text))
print('First 500 chars:', all_text[:500])
