import os
import shutil
import glob

base_search_path = "/mnt/c/Users/James/.gemini/antigravity/brain"
dest_dir = os.getcwd()

file_mappings = {
    "frameio_dashboard_hero.png": "frameio_dashboard_hero*.png",
    "frameio_layout_viz.png": "frameio_layout_viz*.png",
    "frameio_comments_viz.png": "frameio_comments_viz*.png",
    "frameio_assets_grid.png": "frameio_assets_grid*.png",
    "frameio_workflow_pipeline.png": "frameio_workflow_pipeline*.png"
}

print(f"Searching for images in {base_search_path}...")

for simple_name, pattern in file_mappings.items():
    search_pattern = os.path.join(base_search_path, "**", pattern)
    found_files = glob.glob(search_pattern, recursive=True)
    
    if found_files:
        latest_file = max(found_files, key=os.path.getmtime)
        print(f"Found {latest_file} -> Copying to {simple_name}")
        shutil.copy2(latest_file, os.path.join(dest_dir, simple_name))
    else:
        print(f"❌ Could not find any match for {pattern}")
