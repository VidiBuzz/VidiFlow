# VidiCityProfileScraper - Complete Documentation

## Project Overview

This project created web scrapers to collect business directory data from Google Maps for two different industries:
1. **Kratom Vendors & Kava Tea Bars** - South Florida and nationwide
2. **AI & Visual AI Consulting Companies** - 8 target regions across the United States

---

## Target Regions (8 Regions)

| Region | State | AI Companies Found |
|--------|-------|-------------------|
| South Florida | FL | 150 companies |
| San Francisco | CA | 132 companies |
| Detroit | MI | 71 companies |
| Denver | CO | 70 companies |
| Bentonville | AR | 58 companies |
| Saint Louis | MO | 44 companies |
| Chicago | IL | 40 companies |
| Cleveland | OH | 35 companies |

**Total: 600 unique AI companies**

---

## Files Created

### Python Scripts

| File | Purpose | Status |
|------|---------|--------|
| `kratom_kava_scraper.py` | Scrapes kratom vendors and kava bars from Google Maps | Complete |
| `ai_visual_rag_scraper.py` | V1 scraper for AI companies (less filtering) | Complete |
| `ai_companies_scraper_v2.py` | V2 scraper with better AI filtering and categorization | Complete |
| `scrape_company_descriptions.py` | V1 description scraper | Complete |
| `scrape_descriptions_improved.py` | V2 description scraper with better error handling | Complete |
| `generate_ai_directory_v3.py` | Generates HTML directory with descriptions | Complete |
| `fetch_zeus.py` | Test script for debugging single website | Debug |

### Data Files (JSON)

| File | Description | Size |
|------|-------------|------|
| `kratom_kava_complete_20260214_140628.json` | Raw kratom/kava business data | 273KB |
| `ai_companies_v2_20260216_133614.json` | Raw AI companies data (600 companies) | 500KB |
| `company_descriptions.json` | Company descriptions scraped from websites | 295 entries |

### Output Files (HTML)

| File | Description |
|------|-------------|
| `kratom_kava_complete_directory.html` | Interactive directory with yellow titles, phone numbers, website links |
| `ai_consultants_directory_v3.html` | AI companies directory with descriptions, categorized by business type |

---

## Kratom & Kava Directory

### Search Terms Used
- `kratom vendor`
- `kava bar`
- `kratom tea bar`
- `kava tea house`
- `kratom shop`

### Data Collected
- Business Name
- Address
- Phone Number
- Website URL
- Google Maps URL
- Rating (when available)
- Category (Kratom Vendor, Kava Bar, etc.)

### Results
- **240+ businesses** collected
- Primary focus: South Florida
- Includes nationwide listings found during searches

---

## AI & Visual AI Consulting Directory

### Search Terms Used
- `AI consulting`
- `artificial intelligence company`
- `machine learning consulting`
- `computer vision company`
- `visual AI`
- `AI development`
- `AI automation`
- `RAG development`
- `LLM consulting`
- `AI solutions`

### Category Exclusions (Non-AI Businesses Filtered Out)
- Hardware repair
- IT support / IT services (generic)
- Computer repair
- Phone repair
- Electronics store
- Web hosting (without AI)
- SEO services (without AI)
- Marketing agency (without AI)

### Business Type Classification

| Business Type | Count | Keywords Used |
|--------------|-------|---------------|
| AI/ML Development | 385 | machine learning, ml, ai development, neural network, deep learning |
| AI Consulting/Strategy | 85 | consulting, strategy, advisory, solutions |
| AI Automation | 84 | automation, automated, workflow, rpa |
| Visual AI/Computer Vision | 33 | computer vision, image recognition, visual ai, video analytics |
| RAG/LLM/NLP | 4 | rag, llm, nlp, language model, chatbot |
| AI Infrastructure/MLOps | 6 | mlops, infrastructure, deployment, pipeline |
| Data Science/Analytics | 3 | data science, analytics, big data |

### Data Collected
- Business Name
- Address
- Phone Number
- Website URL
- Google Maps URL
- Rating
- Business Type (categorized)
- Company Description (when available)

### Results
- **600 unique AI companies** (after deduplication and filtering)
- **295 companies with descriptions** (scraped from websites)
- **305 companies missing descriptions** (due to bot protection or timeouts)

---

## Technical Implementation

### Dependencies
```python
# Required Python packages
playwright>=1.40.0
beautifulsoup4>=4.12.0
requests>=2.31.0
```

### Installation
```bash
pip install playwright beautifulsoup4 requests
playwright install chromium
```

### Google Maps Scraping Approach

1. **Navigate to Google Maps**
   ```python
   await page.goto('https://www.google.com/maps')
   ```

2. **Search for businesses**
   ```python
   search_box = await page.wait_for_selector('input#searchboxinput')
   await search_box.fill(search_query)
   await page.keyboard.press('Enter')
   ```

3. **Scroll to load more results**
   ```python
   sidebar = await page.wait_for_selector('div[role="feed"]')
   for _ in range(scroll_count):
       await sidebar.evaluate('el => el.scrollTop = el.scrollHeight')
       await page.wait_for_timeout(2000)
   ```

4. **Extract business data**
   ```python
   # Business cards selector
   cards = await page.query_selector_all('div.Nv2PK')
   
   # Name selector
   name_el = await card.query_selector('a.hfpxzc')
   
   # Address selector
   address_el = await card.query_selector('div.W4Efsd:last-child > div.W4Efsd')
   ```

5. **Visit individual pages for more data**
   ```python
   # Click on business card
   await card.click()
   
   # Wait for details panel
   await page.wait_for_selector('div[role="feed"]', state='hidden')
   
   # Extract phone number
   phone_button = await page.query_selector('button[data-item-id*="phone:tel"]')
   phone = await phone_button.get_attribute('data-item-id')
   # Returns: "phone:tel:+1-555-123-4567"
   ```

### Description Scraping Approach

1. **Try multiple methods in order**:
   - Meta description tag
   - Open Graph description
   - Hero section text
   - About section text
   - First paragraph text
   - Body text (fallback)

2. **Handle encoding issues**:
   ```python
   import sys
   import io
   sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
   ```

3. **Handle bot protection**:
   - Use realistic User-Agent headers
   - Add random delays between requests
   - Handle Cloudflare blocks gracefully

---

## Known Issues & Limitations

### Bot Protection
Many websites use Cloudflare, Akamai, or similar bot detection services that block automated browsers. Affected sites return:
- "Navigation blocked" errors
- 403 Forbidden responses
- JavaScript challenge pages

**Workaround attempted:**
- Using Playwright with real browser
- Adding realistic headers
- Random delays

**Sites that couldn't be scraped:**
- Zeus Consulting Services (zeusconsultingservices.com)
- Various other sites with Cloudflare protection

### Unicode Encoding
Windows console uses CP1252 by default, causing issues with non-ASCII characters.

**Solution:**
```python
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
```

### Google Maps Rate Limiting
Google Maps may rate-limit or block IP addresses making too many requests.

**Solution:**
- Add random delays between requests
- Limit scroll iterations
- Use residential proxies if needed

---

## How to Recreate This Project

### Step 1: Install Dependencies
```bash
pip install playwright beautifulsoup4 requests
playwright install chromium
```

### Step 2: Run Kratom/Kava Scraper
```bash
python kratom_kava_scraper.py
```
Output: `kratom_kava_complete_20260214_140628.json`

### Step 3: Run AI Companies Scraper V2
```bash
python ai_companies_scraper_v2.py
```
Output: `ai_companies_v2_20260216_133614.json`

### Step 4: Scrape Company Descriptions
```bash
python scrape_descriptions_improved.py
```
Output: `company_descriptions.json`

### Step 5: Generate HTML Directory
```bash
python generate_ai_directory_v3.py
```
Output: `ai_consultants_directory_v3.html`

---

## File Structure

```
m:/code/vidismart/
├── VidiCityProfileScraper.md          # This documentation file
├── kratom_kava_scraper.py             # Kratom/kava scraper script
├── kratom_kava_complete_20260214_140628.json  # Kratom data
├── kratom_kava_complete_directory.html        # Kratom HTML output
├── ai_visual_rag_scraper.py           # AI scraper V1 (deprecated)
├── ai_companies_scraper_v2.py         # AI scraper V2 (current)
├── ai_companies_v2_20260216_133614.json       # AI companies data
├── scrape_company_descriptions.py     # Description scraper V1
├── scrape_descriptions_improved.py    # Description scraper V2
├── company_descriptions.json          # Scraped descriptions
├── generate_ai_directory_v3.py        # HTML generator
├── ai_consultants_directory_v3.html   # Final AI directory
└── fetch_zeus.py                      # Debug script
```

---

## Future Improvements

1. **Use residential proxies** to bypass bot protection
2. **Add CAPTCHA solving** for protected sites
3. **Implement retry logic** with exponential backoff
4. **Add more data sources** (Yelp, Yellow Pages, LinkedIn)
5. **Create PDF/DOCX exports** for offline use
6. **Add geocoding** for latitude/longitude coordinates
7. **Implement scheduling** for regular updates

---

## Statistics Summary

### Kratom/Kava Directory
- **Total Businesses:** 240+
- **With Phone Numbers:** ~200
- **With Websites:** ~180
- **Primary Region:** South Florida

### AI Companies Directory
- **Total Companies:** 600
- **With Descriptions:** 295 (49%)
- **With Phone Numbers:** 523 (87%)
- **With Websites:** 537 (90%)
- **Regions Covered:** 8

### Business Type Breakdown
- AI/ML Development: 385 (64%)
- AI Consulting/Strategy: 85 (14%)
- AI Automation: 84 (14%)
- Visual AI/Computer Vision: 33 (5.5%)
- AI Infrastructure/MLOps: 6 (1%)
- RAG/LLM/NLP: 4 (0.7%)
- Data Science/Analytics: 3 (0.5%)

---

## Contact & Support

This documentation was auto-generated as part of the VidiCityProfileScraper project. For questions or issues, refer to the Python scripts for implementation details.

**Last Updated:** February 2026
