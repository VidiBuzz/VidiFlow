import os
import requests

# Define a list of candidate URLs for each asset. 
# The script will try them in order until one works.
assets_candidates = {
    "router.jpg": [
        "https://c1.neweggimages.com/productimage/nb640/33-222-322-05.jpg", # Netgear PR460X
        "https://www.netgear.com/media/PR460X_Image_1_tcm148-132336.png"
    ],
    "switch.jpg": [
        "https://c1.neweggimages.com/productimage/nb640/33-122-990-V01.jpg", # Netgear GS728TPP (Guess/Search)
        "https://www.netgear.com/media/GS728TPP_1_tcm148-66173.png",
        "https://c1.neweggimages.com/productimage/nb640/33-122-606-V01.jpg"
    ],
    "ap.jpg": [
        "https://c1.neweggimages.com/productimage/nb640/33-122-262-V01.jpg", # WAX630
        "https://www.netgear.com/media/WAX630_Image_1_tcm148-111116.png",
        "https://www.netgear.com/media/WAX630E_Image_1_tcm148-132336.png" 
    ],
    "rack.jpg": [
        "https://c1.neweggimages.com/productimage/nb640/16-129-170-S05.jpg" # StarTech RK920WALM
    ],
    "crimper.png": [
        "https://www.kleintools.com/sites/all/product_assets/VDV226110/PNG/vdv226110.png" # Klein VDV226-110
    ],
    "poe.jpg": [
        "https://sgcdn.startech.com/005369/media/products/gallery_large/POEEXT1GAT.main.jpg", # StarTech POE
        "https://media.startech.com/cms/products/gallery_large/poeext1gat.main.jpg"
    ],
    "starlink.jpg": [
        "https://media.cnn.com/api/v1/images/stellar/prod/220524103102-starlink-residential-dish.jpg", # CNN Gen 2 Image
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Starlink_Dish.jpg/640px-Starlink_Dish.jpg" # Wikimedia Fallback
    ]
}

os.makedirs("assets", exist_ok=True)

# Headers to mimic a real browser to avoid 403s
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
}

def download_asset(filename, candidates):
    path = os.path.join("assets", filename)
    print(f"Attempting to download {filename}...")
    
    for url in candidates:
        try:
            print(f"  Trying {url}...")
            r = requests.get(url, headers=headers, timeout=10)
            if r.status_code == 200 and len(r.content) > 1000: # Ensure not empty/tiny error file
                with open(path, "wb") as f:
                    f.write(r.content)
                print(f"  [SUCCESS] Saved {filename} from {url}")
                return True
            else:
                print(f"  [FAILED] Status: {r.status_code}, Length: {len(r.content)}")
        except Exception as e:
            print(f"  [ERROR] {e}")
    
    print(f"  [CRITICAL] Failed to download {filename} from all candidates.")
    return False

# Execute
success_count = 0
for name, urls in assets_candidates.items():
    if download_asset(name, urls):
        success_count += 1

print(f"\nSummary: {success_count}/{len(assets_candidates)} assets downloaded.")
