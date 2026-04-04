import os
import shutil
import sys

def convert_path(path):
    """Convert Windows path to WSL path if needed."""
    if os.name == 'posix' and ':' in path:
        # Simple heuristic for WSL: C:\Path -> /mnt/c/Path
        drive, rest = path.split(':', 1)
        wsl_path = f"/mnt/{drive.lower()}{rest.replace('\\', '/')}"
        return wsl_path
    return path

# Define paths (Windows format)
source_dir_win = r"C:\Users\James\.gemini\antigravity\brain\b1326beb-0255-458a-a53d-7bc11957221f"
dest_dir_win = r"m:\code\vidismart\images"

# Convert to current environment format
source_dir = convert_path(source_dir_win)
dest_dir = convert_path(dest_dir_win)

print(f"Source: {source_dir}")
print(f"Destination: {dest_dir}")

# Ensure destination exists
if not os.path.exists(dest_dir):
    try:
        os.makedirs(dest_dir)
        print(f"Created directory: {dest_dir}")
    except OSError as e:
        print(f"Error creating directory {dest_dir}: {e}")
        sys.exit(1)

# Check source existence
if not os.path.exists(source_dir):
    print(f"Error: Source directory not found at {source_dir}")
    print("Please verify the path.")
    sys.exit(1)

# Get list of files
try:
    files = [f for f in os.listdir(source_dir) if os.path.isfile(os.path.join(source_dir, f))]
    print(f"Found {len(files)} files to copy.")
except OSError as e:
    print(f"Error listing files in {source_dir}: {e}")
    sys.exit(1)

copied_count = 0
errors = 0

for f in files:
    src_path = os.path.join(source_dir, f)
    dst_path = os.path.join(dest_dir, f)
    
    try:
        shutil.copy2(src_path, dst_path)
        copied_count += 1
        if copied_count % 10 == 0:
            print(f"Copied {copied_count} files...")
    except Exception as e:
        print(f"Error copying {f}: {e}")
        errors += 1

print(f"Operation complete. Copied: {copied_count}, Errors: {errors}")
