import os
import shutil
import webbrowser

src_dir = r"C:\Users\James\.gemini\antigravity\brain\bc5363c4-3931-4b21-8a0d-6770bf36dd14"
dest_dir = r"m:\code\vidismart\images"

# 1. Create the destination directory
os.makedirs(dest_dir, exist_ok=True)

# 2. Copy the generated AI images over to the project folder
images = [
    "backlink_intelligence_v2_1774911461705.png",
    "backlink_exchange_network_v2_1774911474275.png",
    "ai_search_visibility_v2_1774911488553.png",
    "content_engine_v2_1774911500521.png",
    "internal_linking_v2_1774911511837.png",
    "technical_seo_v2_1774911525975.png",
    "rank_tracking_keywords_v2_1774911538873.png",
    "local_seo_1774910351926.png",
    "marketing_engine_1774910364223.png",
    "client_portal_reporting_1774910379326.png"
]

print(f"Copying images to {dest_dir}...")
for img in images:
    src_path = os.path.join(src_dir, img)
    dest_path = os.path.join(dest_dir, img)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)

# 3. Generate a beautiful Fancybox HTML gallery that references these local images
html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Savage Digital Solutions - Gallery</title>
    <!-- Fancybox CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css" />
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #0d1117; color: #fff; text-align: center; padding: 40px 20px; }
        h1 { color: #58a6ff; }
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto; }
        .gallery-card { background-color: #161b22; border-radius: 12px; border: 1px solid #30363d; overflow: hidden; transition: 0.2s; }
        .gallery-card:hover { transform: translateY(-5px); border-color: #58a6ff; }
        .gallery-card a { display: block; height: 250px; overflow: hidden; }
        .gallery-card img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
        .gallery-card a:hover img { transform: scale(1.05); }
        .card-content { padding: 20px; text-align: left; }
        .card-content h3 { margin: 0; font-size: 1.2rem; color: #c9d1d9; }
    </style>
</head>
<body>
    <h1>Savage Digital Solutions - AI Images</h1>
    <p style="color:#8b949e; margin-bottom: 40px;">Click any image to zoom, share, and expand to fullscreen.</p>
    <div class="gallery-grid">
"""

titles = [
    "1. Backlink Intelligence", "2. Backlink Exchange Network", "3. AI Search Visibility", 
    "4. Content Engine", "5. Internal Linking", "6. Technical SEO", 
    "7. Rank Tracking & Keywords", "8. Local SEO", "9. Marketing Engine", "10. Client Portal & Reporting"
]

for img, title in zip(images, titles):
    html += f"""
        <div class="gallery-card">
            <a href="{img}" data-fancybox="gallery" data-caption="{title}">
                <img src="{img}" alt="{title}">
            </a>
            <div class="card-content"><h3>{title}</h3></div>
        </div>
    """

html += """
    </div>
    <!-- Fancybox JS -->
    <script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js"></script>
    <script>Fancybox.bind("[data-fancybox]", { Thumbs: { type: "classic" } });</script>
</body>
</html>
"""

gallery_path = os.path.join(dest_dir, "gallery.html")
with open(gallery_path, "w", encoding="utf-8") as f:
    f.write(html)

print("Gallery generated successfully!")
webbrowser.open("file:///" + gallery_path.replace("\\", "/"))
