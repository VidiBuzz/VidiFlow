#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Batch Process Images with BrandSwap
Processes all rebranded images and saves output to /images/out_brandswap/
"""

from pathlib import Path
import cv2
from fix_logo_alignment import detect_logo_improved, replace_logo_aligned
import sys

def batch_process_folder(template_path, input_folder, output_folder, threshold=0.45, overlay_text="VidiSmart™"):
    """
    Process all images in a folder and save to output folder
    """
    template_path = Path(template_path)
    input_folder = Path(input_folder)
    output_folder = Path(output_folder)

    if not template_path.exists():
        print(f"❌ Template not found: {template_path}")
        return

    if not input_folder.exists():
        print(f"❌ Input folder not found: {input_folder}")
        return

    # Create output folder
    output_folder.mkdir(parents=True, exist_ok=True)

    # Find all image files
    image_extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']
    image_files = []
    for ext in image_extensions:
        image_files.extend(input_folder.glob(f'*{ext}'))

    total_files = len(image_files)
    processed = 0
    skipped = 0
    errors = 0

    print("\n" + "="*80)
    print(f"BATCH BRANDSWAP PROCESSING")
    print("="*80)
    print(f"📄 Template: {template_path.name}")
    print(f"📁 Input folder: {input_folder}")
    print(f"📁 Output folder: {output_folder}")
    print(f"📊 Found {total_files} images")
    print(f"🎯 Threshold: {threshold}")
    print(f"✏️  Overlay text: {overlay_text}")
    print("="*80 + "\n")

    for i, image_file in enumerate(image_files, 1):
        print(f"[{i}/{total_files}] Processing: {image_file.name}")

        # Detect logo
        found, confidence, bbox, region = detect_logo_improved(
            image_file,
            template_path,
            threshold=threshold,
            debug=False
        )

        if found:
            # Create output path
            output_path = output_folder / image_file.name

            # Replace logo
            try:
                replace_logo_aligned(image_file, output_path, bbox, overlay_text, debug=False)
                print(f"  ✅ Processed (confidence: {confidence:.3f})")
                processed += 1
            except Exception as e:
                print(f"  ❌ Error: {e}")
                errors += 1
        else:
            print(f"  ⚠️  Skipped (logo not detected, best: {confidence:.3f})")
            skipped += 1

    print("\n" + "="*80)
    print("BATCH PROCESSING COMPLETE")
    print("="*80)
    print(f"✅ Processed: {processed}/{total_files}")
    print(f"⚠️  Skipped: {skipped}/{total_files}")
    print(f"❌ Errors: {errors}/{total_files}")
    print(f"📁 Output saved to: {output_folder}")
    print("="*80 + "\n")


def batch_process_all_rebranded_folders(template_path, base_images_folder, threshold=0.45):
    """
    Process all rebranded subfolders
    """
    base_images_folder = Path(base_images_folder)
    rebranded_folder = base_images_folder / "rebranded"
    output_base = base_images_folder / "out_brandswap"

    if not rebranded_folder.exists():
        print(f"❌ Rebranded folder not found: {rebranded_folder}")
        return

    # Find all subdirectories in rebranded/
    subdirs = [d for d in rebranded_folder.iterdir() if d.is_dir()]

    print("\n" + "="*80)
    print(f"PROCESSING ALL REBRANDED FOLDERS")
    print("="*80)
    print(f"Found {len(subdirs)} folders to process")
    print("="*80 + "\n")

    for i, subdir in enumerate(subdirs, 1):
        print(f"\n{'='*80}")
        print(f"[{i}/{len(subdirs)}] FOLDER: {subdir.name}")
        print(f"{'='*80}")

        # Create corresponding output folder
        output_folder = output_base / subdir.name

        # Process this folder
        batch_process_folder(template_path, subdir, output_folder, threshold)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Process single folder:")
        print("    python batch_process_to_images.py <template.png> <input_folder> <output_folder> [--threshold 0.45]")
        print()
        print("  Process all rebranded folders:")
        print("    python batch_process_to_images.py all <template.png> <images_base_folder> [--threshold 0.45]")
        print()
        print("Examples:")
        print("  python batch_process_to_images.py ../images/notebooklm_template.png \"../images/rebranded/Agent_Orch_2026_Review conv\" ../images/out_brandswap/Agent_Orch")
        print("  python batch_process_to_images.py all ../images/notebooklm_template.png ../images --threshold 0.4")
        sys.exit(1)

    # Parse threshold
    threshold = 0.45
    for i, arg in enumerate(sys.argv):
        if arg == '--threshold' and i + 1 < len(sys.argv):
            threshold = float(sys.argv[i + 1])

    if sys.argv[1] == "all":
        # Process all rebranded folders
        if len(sys.argv) < 4:
            print("❌ Usage: python batch_process_to_images.py all <template.png> <images_base_folder> [--threshold 0.45]")
            sys.exit(1)

        template = sys.argv[2]
        base_folder = sys.argv[3]
        batch_process_all_rebranded_folders(template, base_folder, threshold)

    else:
        # Process single folder
        if len(sys.argv) < 4:
            print("❌ Usage: python batch_process_to_images.py <template.png> <input_folder> <output_folder> [--threshold 0.45]")
            sys.exit(1)

        template = sys.argv[1]
        input_folder = sys.argv[2]
        output_folder = sys.argv[3]
        batch_process_folder(template, input_folder, output_folder, threshold)
