import os
import requests

assets = {
    "router.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Netgear_Nighthawk_R7000_2014-06-22.jpg",
    "switch.jpg": "https://upload.wikimedia.org/wikipedia/commons/3/37/Ethernet_Switch_RJ45.jpg",
    "ap.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/c2/Wireless_access_point.jpg",
    "rack.png": "https://upload.wikimedia.org/wikipedia/commons/3/3d/Racksserver.png",
    "crimper.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/b3/Klein_modular_plug_crimper.jpg",
    "poe.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Power_over_Ethernet_injector.jpg",
    "starlink_logo.svg": "https://upload.wikimedia.org/wikipedia/commons/2/29/Starlink_Logo.svg"
}

os.makedirs("assets", exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

for filename, url in assets.items():
    path = os.path.join("assets", filename)
    print(f"Downloading {filename}...")
    try:
        r = requests.get(url, headers=headers)
        if r.status_code == 200:
            with open(path, "wb") as f:
                f.write(r.content)
            print(f"Saved {filename}")
        else:
            print(f"Failed to download {filename}: {r.status_code}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")
