import os
import shutil
import glob
import sys

# Try Windows paths first, fallback to WSL paths
brain_dir_win = r"C:\Users\James\.gemini\antigravity\brain\ad7b40b0-9706-4c87-b4a6-ec85e6c04910"
brain_dir_wsl = "/mnt/c/Users/James/.gemini/antigravity/brain/ad7b40b0-9706-4c87-b4a6-ec85e6c04910"

brain_dir = brain_dir_win if os.path.exists(brain_dir_win) else brain_dir_wsl

# Potential M and G drive paths
paths_to_check = [
    r"m:\code\VidiPitch\images", 
    r"G:\VidiPitch\images",
    "/mnt/m/code/VidiPitch/images", 
    "/mnt/g/VidiPitch/images"
]

dests = []
for p in paths_to_check:
    parent = os.path.dirname(p)
    if os.path.exists(parent):
        dests.append(p)

for d in dests:
    try:
        os.makedirs(d, exist_ok=True)
    except Exception as e:
        pass

images_to_copy = {
    "avatar_sarah_mitchell": "avatar_sarah.png",
    "avatar_michael_chen": "avatar_michael.png",
    "avatar_jennifer": "avatar_jennifer.png",
    "guarantee_badge": "guarantee_badge.png",
    "hero_dashboard": "hero_dashboard.png"
}

print(f"Using artifact directory: {brain_dir}")

for prefix, target_name in images_to_copy.items():
    pattern = os.path.join(brain_dir, f"{prefix}_*.png")
    matches = glob.glob(pattern)
    if not matches:
        print(f"Could not find artifact for {prefix} using pattern: {pattern}")
        continue
        
    source_file = sorted(matches)[-1]  # Get the latest one if multiple
    for d in dests:
        if os.path.exists(d):
            dest_file = os.path.join(d, target_name)
            try:
                shutil.copy2(source_file, dest_file)
                print(f"Success! Copied {os.path.basename(source_file)} -> {dest_file}")
            except Exception as e:
                print(f"Could not copy to {dest_file}: {e}")

