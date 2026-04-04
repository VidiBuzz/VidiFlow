import os
import shutil
import glob

# Search in the Windows user directory mapped to WSL
# Adjust this base path if necessary based on the error
base_search_path = "/mnt/c/Users/James/.gemini/antigravity/brain"
dest_dir = os.getcwd()

print(f"Searching for images in {base_search_path}...")

# Map of simple names to their keyword patterns to find the latest generated one
file_mappings = {
    "tech_agent_ingestion.png": "tech_agent_ingestion*.png",
    "tech_agent_edit.png": "tech_agent_edit*.png",
    "tech_agent_graphics.png": "tech_agent_graphics*.png",
    "tech_agent_collab.png": "tech_agent_collab*.png",
    "tech_agent_search.png": "tech_agent_search*.png",
    "tech_agent_quality.png": "tech_agent_quality*.png",
    "tech_agent_render.png": "tech_agent_render*.png"
}

for simple_name, pattern in file_mappings.items():
    # Recursive search to find the file in subdirectories (since each session might have a UUID folder)
    search_pattern = os.path.join(base_search_path, "**", pattern)
    found_files = glob.glob(search_pattern, recursive=True)
    
    if found_files:
        # Sort by modification time to get the latest one
        latest_file = max(found_files, key=os.path.getmtime)
        print(f"Found {latest_file} -> Copying to {simple_name}")
        shutil.copy2(latest_file, os.path.join(dest_dir, simple_name))
    else:
        print(f"❌ Could not find any match for {pattern}")
