#!/usr/bin/env python
"""
Extract NotebookLM logo from an image to use as template
Run this first to create the logo template
"""

import cv2
import sys
from pathlib import Path

def extract_logo_from_image(image_path: Path, output_path: Path):
    """
    Open an image and let you manually select the logo region
    """
    img = cv2.imread(str(image_path))

    if img is None:
        print(f"ERROR: Could not load image: {image_path}")
        return False

    print("Instructions:")
    print("1. The image will open in a window")
    print("2. Click and drag to select the NotebookLM logo")
    print("3. Press SPACE or ENTER to save")
    print("4. Press ESC to cancel")
    print("\nPress any key to continue...")

    # Show image and let user select region
    roi = cv2.selectROI("Select NotebookLM Logo", img, fromCenter=False, showCrosshair=True)
    cv2.destroyAllWindows()

    if roi[2] > 0 and roi[3] > 0:
        # Extract the selected region
        x, y, w, h = roi
        logo = img[int(y):int(y+h), int(x):int(x+w)]

        # Save logo template
        cv2.imwrite(str(output_path), logo)
        print(f"✅ Logo template saved to: {output_path}")
        print(f"   Size: {w}x{h} pixels")
        return True
    else:
        print("❌ No selection made")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python create_logo_template.py <image_with_notebooklm_logo>")
        print("\nExample:")
        print("  python create_logo_template.py ../images/some_image.png")
        sys.exit(1)

    source_image = Path(sys.argv[1])
    output_template = Path("../images/notebooklm_logo_template.png")

    if not source_image.exists():
        print(f"ERROR: Image not found: {source_image}")
        sys.exit(1)

    print(f"Extracting logo from: {source_image}")
    print(f"Will save to: {output_template}")
    print()

    if extract_logo_from_image(source_image, output_template):
        print("\n✅ Logo template created!")
        print(f"\nNext steps:")
        print(f"1. Run batch processor:")
        print(f"   python batch_process_folder.py")
        print(f"\n2. Or use the web app:")
        print(f"   https://vidi.news/smartchannel/brandswap")
    else:
        print("\n❌ Failed to create logo template")
