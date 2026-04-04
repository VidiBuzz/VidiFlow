#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Fix BrandSwap Logo Alignment
Improved logo detection with better positioning for NotebookLM and other logos
Uses adaptive positioning and better template matching
"""

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import sys
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def prepare_logo_template(logo_path, output_path=None):
    """
    Prepare logo template for better detection
    - Remove background
    - Convert to proper format
    - Resize if too large
    """
    img = Image.open(logo_path)

    # Convert to RGBA if needed
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Get dimensions
    width, height = img.size

    # Resize if too large (keep aspect ratio)
    max_size = 400
    if max(width, height) > max_size:
        ratio = max_size / max(width, height)
        new_width = int(width * ratio)
        new_height = int(height * ratio)
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # Save prepared template
    if output_path:
        img.save(output_path, 'PNG')
        print(f"✅ Prepared template saved to: {output_path}")
        print(f"   Size: {img.size}")

    return img


def detect_logo_improved(image_path, template_path, threshold=0.45, debug=False):
    """
    Improved logo detection with multiple methods
    Returns: (found, confidence, bbox, method)
    """
    # Read images
    img_bgr = cv2.imread(str(image_path))
    template_bgr = cv2.imread(str(template_path), cv2.IMREAD_UNCHANGED)

    if img_bgr is None or template_bgr is None:
        print(f"❌ Failed to load images")
        return False, 0, None, None

    h, w = img_bgr.shape[:2]

    # Convert to grayscale for template matching
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # Handle RGBA template
    if template_bgr.shape[2] == 4:
        template_gray = cv2.cvtColor(template_bgr[:, :, :3], cv2.COLOR_BGR2GRAY)
    else:
        template_gray = cv2.cvtColor(template_bgr, cv2.COLOR_BGR2GRAY)

    # Define search regions (prioritize bottom-right)
    search_regions = [
        {
            "name": "bottom-right-corner",
            "x_start": int(w * 0.75),
            "y_start": int(h * 0.85),
            "x_end": w,
            "y_end": h
        },
        {
            "name": "bottom-right-wide",
            "x_start": int(w * 0.65),
            "y_start": int(h * 0.80),
            "x_end": w,
            "y_end": h
        },
        {
            "name": "bottom-full",
            "x_start": 0,
            "y_start": int(h * 0.85),
            "x_end": w,
            "y_end": h
        }
    ]

    best_match = 0
    best_bbox = None
    best_region = None
    best_scale = None

    # Try multiple scales - focus on smaller sizes for logos in video
    scales = [0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4]

    if debug:
        print(f"\n🔍 Searching for logo in {image_path.name}")
        print(f"   Image size: {w}x{h}")
        print(f"   Template size: {template_gray.shape[1]}x{template_gray.shape[0]}")

    # Try each region
    for region in search_regions:
        roi = img_gray[region["y_start"]:region["y_end"],
                      region["x_start"]:region["x_end"]]

        if roi.size == 0:
            continue

        # Try each scale
        for scale in scales:
            new_w = int(template_gray.shape[1] * scale)
            new_h = int(template_gray.shape[0] * scale)

            # Skip if scaled template is too large or too small
            if new_w > roi.shape[1] or new_h > roi.shape[0] or new_w < 10 or new_h < 10:
                continue

            # Resize template
            resized_template = cv2.resize(template_gray, (new_w, new_h), interpolation=cv2.INTER_AREA)

            # Try multiple matching methods
            methods = [
                cv2.TM_CCOEFF_NORMED,
                cv2.TM_CCORR_NORMED,
                cv2.TM_SQDIFF_NORMED
            ]

            for method in methods:
                result = cv2.matchTemplate(roi, resized_template, method)

                # For SQDIFF, lower is better, invert the score
                if method == cv2.TM_SQDIFF_NORMED:
                    min_val, _, min_loc, _ = cv2.minMaxLoc(result)
                    max_val = 1 - min_val
                    max_loc = min_loc
                else:
                    _, max_val, _, max_loc = cv2.minMaxLoc(result)

                if max_val > best_match:
                    best_match = max_val
                    # Adjust coordinates to full image
                    x = region["x_start"] + max_loc[0]
                    y = region["y_start"] + max_loc[1]
                    best_bbox = (x, y, new_w, new_h)
                    best_region = region["name"]
                    best_scale = scale

    if debug and best_match > 0:
        print(f"   Best match: {best_match:.3f} (threshold: {threshold})")
        print(f"   Region: {best_region}")
        print(f"   Scale: {best_scale}")
        if best_bbox:
            print(f"   Position: ({best_bbox[0]}, {best_bbox[1]}) Size: {best_bbox[2]}x{best_bbox[3]}")

    if best_match >= threshold:
        return True, best_match, best_bbox, best_region

    return False, best_match, None, None


def create_vidismart_overlay(width, height, text="VidiSmart™"):
    """
    Create VidiSmart branded overlay with proper styling
    """
    overlay = Image.new("RGBA", (width, height), (15, 23, 42, 255))
    draw = ImageDraw.Draw(overlay)

    # Try to load custom font
    font_paths = [
        "/mnt/m/code/vidismart/KumbhSans-VariableFont_wght.ttf",
        "m:/code/vidismart/KumbhSans-VariableFont_wght.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "C:/Windows/Fonts/Arial.ttf"
    ]

    font = None
    font_size = int(height * 0.35)

    for font_path in font_paths:
        try:
            font = ImageFont.truetype(font_path, font_size)
            break
        except:
            continue

    if font is None:
        font = ImageFont.load_default()

    # Get text dimensions
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center text
    x = (width - text_width) // 2
    y = (height - text_height) // 2 - 3

    # Draw shadow
    shadow_color = (0, 0, 0, 128)
    draw.text((x + 2, y + 2), text, font=font, fill=shadow_color)

    # Draw text
    text_color = (255, 255, 255, 255)
    draw.text((x, y), text, font=font, fill=text_color)

    # Draw border
    border_color = (59, 130, 246, 255)
    draw.rectangle([0, 0, width - 1, height - 1], outline=border_color, width=2)

    return overlay


def replace_logo_aligned(image_path, output_path, bbox, overlay_text="VidiSmart™", debug=False):
    """
    Replace detected logo with properly aligned overlay
    """
    img = Image.open(image_path)
    x, y, w, h = bbox

    # Create overlay
    overlay = create_vidismart_overlay(w, h, overlay_text)

    # Paste overlay at exact position
    img.paste(overlay, (x, y), overlay)

    # Save with high quality
    img.save(output_path, quality=95, optimize=True)

    if debug:
        print(f"✅ Logo replaced and saved to: {output_path}")

    return output_path


def test_logo_detection(template_path, test_image_path, output_path=None, threshold=0.45):
    """
    Test logo detection on a single image
    """
    print("\n" + "="*80)
    print("BRANDSWAP LOGO DETECTION TEST")
    print("="*80)

    template_path = Path(template_path)
    test_image_path = Path(test_image_path)

    if not template_path.exists():
        print(f"❌ Template not found: {template_path}")
        return False

    if not test_image_path.exists():
        print(f"❌ Test image not found: {test_image_path}")
        return False

    print(f"📄 Template: {template_path.name}")
    print(f"📄 Test image: {test_image_path.name}")
    print(f"🎯 Threshold: {threshold}")

    # Detect logo
    found, confidence, bbox, region = detect_logo_improved(
        test_image_path,
        template_path,
        threshold=threshold,
        debug=True
    )

    if found:
        print(f"\n✅ LOGO DETECTED!")
        print(f"   Confidence: {confidence:.3f}")
        print(f"   Bounding box: {bbox}")

        # Replace logo if output path provided
        if output_path:
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            replace_logo_aligned(test_image_path, output_path, bbox, debug=True)
            print(f"\n📁 Output saved to: {output_path}")

        return True
    else:
        print(f"\n❌ LOGO NOT DETECTED")
        print(f"   Best confidence: {confidence:.3f} (below threshold {threshold})")
        print(f"\n💡 Try:")
        print(f"   1. Lower threshold: --threshold 0.3")
        print(f"   2. Prepare template: python fix_logo_alignment.py prepare <logo.png>")
        print(f"   3. Use clearer template image")

        return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Prepare template:")
        print("    python fix_logo_alignment.py prepare <logo.png> [output.png]")
        print()
        print("  Test detection:")
        print("    python fix_logo_alignment.py test <template.png> <test_image.jpg> [output.jpg] [--threshold 0.45]")
        print()
        print("Examples:")
        print("  python fix_logo_alignment.py prepare ../images/notebooklm.png ../images/notebooklm_template.png")
        print("  python fix_logo_alignment.py test ../images/notebooklm_template.png ../images/test.jpg output.jpg --threshold 0.4")
        sys.exit(1)

    command = sys.argv[1]

    if command == "prepare":
        if len(sys.argv) < 3:
            print("❌ Usage: python fix_logo_alignment.py prepare <logo.png> [output.png]")
            sys.exit(1)

        logo_path = Path(sys.argv[2])
        output_path = Path(sys.argv[3]) if len(sys.argv) > 3 else logo_path.parent / f"{logo_path.stem}_template.png"

        prepare_logo_template(logo_path, output_path)
        print(f"\n✅ Template prepared! Use this for detection:")
        print(f"   {output_path}")

    elif command == "test":
        if len(sys.argv) < 4:
            print("❌ Usage: python fix_logo_alignment.py test <template.png> <test_image.jpg> [output.jpg] [--threshold 0.45]")
            sys.exit(1)

        template = sys.argv[2]
        test_image = sys.argv[3]
        output = sys.argv[4] if len(sys.argv) > 4 and not sys.argv[4].startswith('--') else None

        # Parse threshold
        threshold = 0.45
        for i, arg in enumerate(sys.argv):
            if arg == '--threshold' and i + 1 < len(sys.argv):
                threshold = float(sys.argv[i + 1])

        success = test_logo_detection(template, test_image, output, threshold)
        sys.exit(0 if success else 1)

    else:
        print(f"❌ Unknown command: {command}")
        print("   Use 'prepare' or 'test'")
        sys.exit(1)
