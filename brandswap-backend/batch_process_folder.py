#!/usr/bin/env python
"""
Batch process all images in a folder with BrandSwap
Replaces NotebookLM logos with VidiSmart branding
"""

import requests
import sys
from pathlib import Path

# Configuration
API_URL = "http://localhost:8080/api/brandswap/process"
IMAGES_DIR = Path("../images")
LOGO_TEMPLATE = Path("../images/notebooklm_logo_template.png")  # You need to provide this
OVERLAY_TEXT = "VidiSmart™"
THRESHOLD = 0.55

def batch_process_images(folder: Path, logo_template: Path, recursive: bool = True):
    """
    Process all images in a folder (and subfolders) through BrandSwap API
    """
    # Find all image and video files recursively
    extensions = ['*.jpg', '*.jpeg', '*.png', '*.mp4', '*.mov']
    files_to_process = []

    for ext in extensions:
        if recursive:
            # Search all subfolders
            all_files = list(folder.rglob(ext))
            # Skip files in 'rebranded' folders (already processed)
            # Skip files in main images/ folder (no NotebookLM logos there)
            files_to_process.extend([f for f in all_files
                                   if 'rebranded' not in str(f)
                                   and f.parent != folder])
        else:
            # Only current folder
            files_to_process.extend(list(folder.glob(ext)))

    print(f"Found {len(files_to_process)} files to process")

    # Show folder breakdown
    folders = {}
    for f in files_to_process:
        folder_name = f.parent.name
        folders[folder_name] = folders.get(folder_name, 0) + 1

    print(f"\nFiles by folder:")
    for folder_name, count in sorted(folders.items()):
        print(f"  {folder_name}: {count} files")

    if not logo_template.exists():
        print(f"\nERROR: Logo template not found at {logo_template}")
        print("Please provide a NotebookLM logo image as the template")
        print("\nRun this first:")
        print("  python create_logo_template.py ../images/sample_image.png")
        return

    # Prepare form data
    form_data = {
        'overlayText': (None, OVERLAY_TEXT),
        'threshold': (None, str(THRESHOLD)),
        'position': (None, 'bottom-right')
    }

    # Add logo template
    form_data['logo'] = ('template.png', open(logo_template, 'rb'), 'image/png')

    # Process in batches of 20 files (to avoid timeout)
    batch_size = 20
    total_batches = (len(files_to_process) + batch_size - 1) // batch_size
    processed_count = 0
    skipped_count = 0
    error_count = 0

    # Log results
    log_file = Path('batch_process_log.txt')

    for i in range(0, len(files_to_process), batch_size):
        batch = files_to_process[i:i+batch_size]
        batch_num = i//batch_size + 1
        print(f"\n{'='*60}")
        print(f"Batch {batch_num}/{total_batches} ({len(batch)} files)")
        print(f"Progress: {i}/{len(files_to_process)} files processed")
        print(f"{'='*60}")

        # Add files to form data
        files = []
        for file_path in batch:
            mime_type = 'video/mp4' if file_path.suffix.lower() in ['.mp4', '.mov'] else 'image/png'
            files.append(('files', (file_path.name, open(file_path, 'rb'), mime_type)))

        try:
            # Make API request
            response = requests.post(API_URL, data=form_data, files=files, timeout=600)

            if response.status_code == 200:
                result = response.json()
                print(f"✅ Batch completed!")
                print(f"   Session ID: {result['sessionId']}")

                # Show and log results
                for r in result['results']:
                    if r['status'] == 'processed':
                        processed_count += 1
                        status_icon = "✅"
                    elif r['status'] == 'skipped':
                        skipped_count += 1
                        status_icon = "⚠️"
                    else:
                        error_count += 1
                        status_icon = "❌"

                    print(f"   {status_icon} {r['filename']}: {r['status']}")

                    # Log to file
                    with open(log_file, 'a') as log:
                        log.write(f"{r['filename']},{r['status']}")
                        if 'cdnUrl' in r:
                            log.write(f",{r['cdnUrl']}")
                            print(f"      CDN: {r['cdnUrl']}")
                        log.write('\n')

                print(f"\nRunning totals: {processed_count} processed, {skipped_count} skipped, {error_count} errors")
            else:
                print(f"❌ Batch Error: {response.status_code}")
                print(response.text)
                error_count += len(batch)

        except Exception as e:
            print(f"❌ Request failed: {e}")

        finally:
            # Close all file handles
            for _, (_, f, _) in files:
                f.close()

    # Close logo template
    form_data['logo'][1].close()

    print(f"\n{'='*60}")
    print(f"FINAL RESULTS")
    print(f"{'='*60}")
    print(f"Total files: {len(files_to_process)}")
    print(f"✅ Processed: {processed_count}")
    print(f"⚠️  Skipped: {skipped_count} (no logo detected)")
    print(f"❌ Errors: {error_count}")
    print(f"\nLog saved to: {log_file}")
    print(f"Output files in: storage/output/")
    print(f"CDN files at: https://cdn.vidi.news/brandswap/[session-id]/")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        folder = Path(sys.argv[1])
    else:
        folder = IMAGES_DIR

    if len(sys.argv) > 2:
        logo = Path(sys.argv[2])
    else:
        logo = LOGO_TEMPLATE

    print(f"BrandSwap Batch Processor")
    print(f"Folder: {folder}")
    print(f"Logo Template: {logo}")
    print(f"Overlay Text: {OVERLAY_TEXT}")
    print(f"Threshold: {THRESHOLD}")
    print("-" * 50)

    batch_process_images(folder, logo)
