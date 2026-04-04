#!/usr/bin/env python3
"""
Simple NotebookLM Logo Detector
Quick scan to show which files have the logo before processing.
"""

import cv2
import numpy as np
from pathlib import Path
from PIL import Image
import sys

# ROI for bottom-right corner (where NotebookLM logo typically is)
ROI_CONFIG = {
    "x_start": 0.75,  # 75% from left
    "y_start": 0.88,  # 88% from top (bottom area)
    "width": 0.25,  # 25% of width
    "height": 0.12,  # 12% of height
}


def detect_logo_simple(image_path):
    """Fast detection of logo-like patterns in bottom-right corner."""
    try:
        img = cv2.imread(str(image_path))
        if img is None:
            return False, "Cannot read image"

        h, w = img.shape[:2]

        # Extract ROI
        x1 = int(w * ROI_CONFIG["x_start"])
        y1 = int(h * ROI_CONFIG["y_start"])
        x2 = w
        y2 = h

        roi = img[y1:y2, x1:x2]

        # Convert to grayscale
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)

        # Check variance - logos usually have high detail
        variance = np.var(gray)

        # Edge detection
        edges = cv2.Canny(gray, 50, 150)
        edge_count = np.sum(edges > 0)

        # Threshold check
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Heuristics
        has_high_detail = variance > 500
        has_edges = edge_count > 100

        is_likely_logo = has_high_detail and has_edges

        return is_likely_logo, f"variance={variance:.0f}, edges={edge_count}"

    except Exception as e:
        return False, str(e)


def scan_folder(folder_path):
    """Scan folder for images with logos."""
    folder = Path(folder_path)

    exts = {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov"}
    files = []
    for ext in exts:
        files.extend(folder.glob(f"*{ext}"))
        files.extend(folder.glob(f"*{ext.upper()}"))

    print(f"Scanning {len(files)} files in {folder}\n")
    print("-" * 80)

    with_logo = []
    without_logo = []
    errors = []

    for i, file_path in enumerate(sorted(files), 1):
        if file_path.suffix.lower() in {".mp4", ".mov"}:
            # Skip video detection for now
            print(f"{i:3d}. [VIDEO] {file_path.name}")
            continue

        has_logo, info = detect_logo_simple(file_path)

        if has_logo:
            with_logo.append(file_path)
            status = "✓ HAS LOGO"
        else:
            without_logo.append(file_path)
            status = "  no logo"

        print(f"{i:3d}. {status:12s} {file_path.name:50s} ({info})")

    print("-" * 80)
    print(f"\nSUMMARY:")
    print(f"  Files with logo detected: {len(with_logo)}")
    print(f"  Files without logo: {len(without_logo)}")
    print(f"  Errors: {len(errors)}")

    if with_logo:
        print(f"\nFiles that will be processed:")
        for f in with_logo:
            print(f"  - {f.name}")

    return with_logo


if __name__ == "__main__":
    folder = sys.argv[1] if len(sys.argv) > 1 else "/mnt/m/code/vidismart/images"
    scan_folder(folder)
