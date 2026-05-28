#!/usr/bin/env python3
"""
BrandSwap Image Rebranding Script

Detects logos in images using multi-scale template matching (OpenCV)
and replaces them with user-provided branding (text or replacement image).

Usage:
    python rebrand.py --input <input_image> --output <output_image> --template <logo_template> \
        --text "VidiSmart" --position top-right --threshold 0.5 \
        --scale-min 0.2 --scale-max 3.0 --scales 12

Output:
    JSON to stdout with match results or error info.
"""

import argparse
import json
import os
import sys
import traceback

try:
    import cv2
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
except ImportError as e:
    print(json.dumps({"error": f"Missing Python dependency: {str(e)}. Install with: pip install opencv-python Pillow numpy"}))
    sys.exit(1)


# Supported image extensions
SUPPORTED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.tif'}


def validate_input(path, label):
    """Validate that a file exists and is a supported image format."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"{label} not found: {path}")
    ext = os.path.splitext(path)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"{label} has unsupported format '{ext}': {path}. Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}")
    return True


def load_image(path, flags=cv2.IMREAD_COLOR):
    """Load an image with error handling."""
    validate_input(path, "Input image")
    img = cv2.imread(path, flags)
    if img is None:
        raise ValueError(f"Failed to decode image (corrupt or unreadable): {path}")
    return img


def load_template(path):
    """Load a template image (with alpha channel if available)."""
    validate_input(path, "Template image")
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError(f"Failed to decode template (corrupt or unreadable): {path}")
    return img


def multi_scale_match(input_gray, template_gray, scale_min, scale_max, num_scales, threshold):
    """
    Perform multi-scale template matching.
    
    Resizes the template at multiple scales and runs cv2.matchTemplate at each.
    Returns the best match above the threshold, or None.
    
    Returns:
        dict with keys: score, x, y, w, h, scale or None
    """
    h_orig, w_orig = template_gray.shape[:2]
    scales = np.linspace(scale_min, scale_max, num_scales)
    
    best_match = None
    best_score = -1.0
    
    for scale in scales:
        # Resize template
        new_w = int(w_orig * scale)
        new_h = int(h_orig * scale)
        
        # Skip if template is larger than input image
        if new_w <= 0 or new_h <= 0:
            continue
        if new_h > input_gray.shape[0] or new_w > input_gray.shape[1]:
            continue
        
        resized = cv2.resize(template_gray, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
        # Skip if resized template is too small to be meaningful
        if new_w < 5 or new_h < 5:
            continue
        
        try:
            result = cv2.matchTemplate(input_gray, resized, cv2.TM_CCOEFF_NORMED)
            _, max_val, _, max_loc = cv2.minMaxLoc(result)
        except cv2.error:
            # Template too large for input at this scale
            continue
        
        if max_val > best_score:
            best_score = max_val
            best_match = {
                'score': float(max_val),
                'x': max_loc[0],
                'y': max_loc[1],
                'w': new_w,
                'h': new_h,
                'scale': float(scale)
            }
    
    if best_match is None or best_match['score'] < threshold:
        return None
    
    return best_match


def sample_surrounding_color(img, x, y, w, h, sample_width=10):
    """
    Sample the average color from the borders surrounding the detected region.
    Used to create a background that blends with the surrounding area.
    """
    h_img, w_img = img.shape[:2]
    
    # Define sample regions around the detected box
    colors = []
    
    # Top strip
    ty1 = max(0, y - sample_width)
    ty2 = y
    tx1 = max(0, x)
    tx2 = min(w_img, x + w)
    if ty2 > ty1 and tx2 > tx1:
        strip = img[ty1:ty2, tx1:tx2]
        if strip.size > 0:
            colors.append(strip.mean(axis=(0, 1)))
    
    # Bottom strip
    ty1 = min(h_img, y + h)
    ty2 = min(h_img, y + h + sample_width)
    tx1 = max(0, x)
    tx2 = min(w_img, x + w)
    if ty2 > ty1 and tx2 > tx1:
        strip = img[ty1:ty2, tx1:tx2]
        if strip.size > 0:
            colors.append(strip.mean(axis=(0, 1)))
    
    # Left strip
    tx1 = max(0, x - sample_width)
    tx2 = x
    ty1 = max(0, y)
    ty2 = min(h_img, y + h)
    if tx2 > tx1 and ty2 > ty1:
        strip = img[ty1:ty2, tx1:tx2]
        if strip.size > 0:
            colors.append(strip.mean(axis=(0, 1)))
    
    # Right strip
    tx1 = min(w_img, x + w)
    tx2 = min(w_img, x + w + sample_width)
    ty1 = max(0, y)
    ty2 = min(h_img, y + h)
    if tx2 > tx1 and ty2 > ty1:
        strip = img[ty1:ty2, tx1:tx2]
        if strip.size > 0:
            colors.append(strip.mean(axis=(0, 1)))
    
    if not colors:
        # Fallback to white
        return (255, 255, 255)
    
    avg = np.mean(colors, axis=0).astype(int)
    return tuple(avg.tolist())


def create_text_replacement(match_rect, text, surrounding_color_bgr, opacity=1.0):
    """
    Create a replacement overlay using Pillow with rendered text.
    
    Returns:
        PIL Image (RGBA) with the text rendered on a matching background.
    """
    x, y, w, h = match_rect['x'], match_rect['y'], match_rect['w'], match_rect['h']
    
    # Convert BGR to RGB for Pillow
    bg_color = (surrounding_color_bgr[2], surrounding_color_bgr[1], surrounding_color_bgr[0])
    
    # Create RGBA overlay
    overlay = Image.new('RGBA', (w, h), (bg_color[0], bg_color[1], bg_color[2], int(255 * opacity)))
    draw = ImageDraw.Draw(overlay)
    
    # Calculate font size to fit within the region (with 10% padding)
    target_w = int(w * 0.85)
    target_h = int(h * 0.85)
    
    # Try to find a suitable font
    font = None
    font_size = max(10, min(h // 2, 72))
    
    # Try common system fonts
    font_names = [
        "arial.ttf", "Arial.ttf", "Arial Bold.ttf",
        "Helvetica.ttf", "Helvetica-Bold.ttf",
        "DejaVuSans.ttf", "DejaVuSans-Bold.ttf",
        "segoeui.ttf", "SegoeUI.ttf",
        "LiberationSans-Regular.ttf", "LiberationSans-Bold.ttf",
    ]
    
    for font_name in font_names:
        try:
            font = ImageFont.truetype(font_name, font_size)
            break
        except (IOError, OSError):
            continue
    
    if font is None:
        # Fall back to default font
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except (IOError, OSError):
            font = ImageFont.load_default()
    
    # Iteratively adjust font size to fit
    for test_size in range(font_size, 6, -1):
        try:
            if font is None or font == ImageFont.load_default():
                font = ImageFont.load_default()
            else:
                # Recreate font at test size
                for font_name in font_names:
                    try:
                        font = ImageFont.truetype(font_name, test_size)
                        break
                    except (IOError, OSError):
                        continue
        except Exception:
            pass
        
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        if text_w <= target_w and text_h <= target_h:
            break
    
    # Center text in the region
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = (w - text_w) // 2
    text_y = (h - text_h) // 2
    
    # Determine text color based on background luminance
    luminance = 0.299 * bg_color[0] + 0.587 * bg_color[1] + 0.114 * bg_color[2]
    text_color = (255, 255, 255) if luminance < 128 else (0, 0, 0)
    
    draw.text((text_x, text_y), text, fill=(text_color[0], text_color[1], text_color[2], int(255 * opacity)), font=font)
    
    return overlay


def paste_replacement(input_img_cv, match_rect, replacement_pil):
    """
    Paste a PIL RGBA replacement image onto an OpenCV BGR image.
    
    Args:
        input_img_cv: Input image as OpenCV BGR numpy array
        match_rect: dict with x, y, w, h
        replacement_pil: PIL RGBA Image to paste
    
    Returns:
        New OpenCV BGR image with replacement applied
    """
    x, y, w, h = match_rect['x'], match_rect['y'], match_rect['w'], match_rect['h']
    
    # Resize replacement to match region
    replacement_resized = replacement_pil.resize((w, h), Image.LANCZOS)
    
    # Convert input to PIL RGB
    input_rgb = cv2.cvtColor(input_img_cv, cv2.COLOR_BGR2RGB)
    input_pil = Image.fromarray(input_rgb).convert('RGBA')
    
    # Composite
    input_pil.paste(replacement_resized, (x, y), replacement_resized)
    
    # Convert back to OpenCV BGR
    result_rgb = np.array(input_pil.convert('RGB'))
    result_bgr = cv2.cvtColor(result_rgb, cv2.COLOR_RGB2BGR)
    
    return result_bgr


def process_image(args):
    """
    Main processing pipeline:
    1. Load images
    2. Multi-scale template matching
    3. Create and apply replacement
    4. Save output
    """
    # Load input image
    input_img = load_image(args.input)
    
    # Load template (supports alpha channel)
    template = load_template(args.template)
    
    # Convert to grayscale for matching
    input_gray = cv2.cvtColor(input_img, cv2.COLOR_BGR2GRAY)
    
    # Handle template: if it has alpha channel, use it to create a mask
    if len(template.shape) == 3 and template.shape[2] == 4:
        template_bgr = template[:, :, :3]
        template_gray = cv2.cvtColor(template_bgr, cv2.COLOR_BGR2GRAY)
        template_mask = template[:, :, 3]
    else:
        if len(template.shape) == 3:
            template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
        else:
            template_gray = template
        template_mask = None
    
    # Multi-scale template matching
    match = multi_scale_match(
        input_gray,
        template_gray,
        args.scale_min,
        args.scale_max,
        args.scales,
        args.threshold
    )
    
    if match is None:
        # No match found - copy original file unchanged
        ext = os.path.splitext(args.output)[1].lower()
        if ext in ('.jpg', '.jpeg'):
            cv2.imwrite(args.output, input_img, [cv2.IMWRITE_JPEG_QUALITY, 95])
        elif ext == '.png':
            cv2.imwrite(args.output, input_img, [cv2.IMWRITE_PNG_COMPRESSION, 3])
        elif ext == '.webp':
            cv2.imwrite(args.output, input_img, [cv2.IMWRITE_WEBP_QUALITY, 95])
        else:
            cv2.imwrite(args.output, input_img)
        
        return {"matched": False}
    
    # Match found - create replacement
    surrounding_color = sample_surrounding_color(input_img, match['x'], match['y'], match['w'], match['h'])
    
    if args.replacement_image:
        # Use replacement image
        validate_input(args.replacement_image, "Replacement image")
        replacement = Image.open(args.replacement_image).convert('RGBA')
    elif args.text:
        # Use text overlay
        replacement = create_text_replacement(match, args.text, surrounding_color, args.overlay_opacity)
    else:
        # Default: fill with surrounding color (blank replacement)
        replacement = Image.new('RGBA', (match['w'], match['h']),
                               (surrounding_color[2], surrounding_color[1], surrounding_color[0], 255))
    
    # Apply replacement
    result = paste_replacement(input_img, match, replacement)
    
    # Save output
    ext = os.path.splitext(args.output)[1].lower()
    if ext in ('.jpg', '.jpeg'):
        cv2.imwrite(args.output, result, [cv2.IMWRITE_JPEG_QUALITY, 95])
    elif ext == '.png':
        cv2.imwrite(args.output, result, [cv2.IMWRITE_PNG_COMPRESSION, 3])
    elif ext == '.webp':
        cv2.imwrite(args.output, result, [cv2.IMWRITE_WEBP_QUALITY, 95])
    else:
        cv2.imwrite(args.output, result)
    
    return {
        "matched": True,
        "confidence": round(match['score'], 4),
        "position": {
            "x": match['x'],
            "y": match['y'],
            "w": match['w'],
            "h": match['h']
        },
        "scale": round(match['scale'], 4)
    }


def main():
    parser = argparse.ArgumentParser(
        description='BrandSwap Image Rebranding - Detect and replace logos in images',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Replace detected logo with text
  python rebrand.py --input photo.jpg --output rebranded.jpg --template old-logo.png --text "VidiSmart"

  # Replace detected logo with an image
  python rebrand.py --input photo.jpg --output rebranded.jpg --template old-logo.png --replacement-image new-logo.png

  # Custom positioning and threshold
  python rebrand.py --input photo.jpg --output rebranded.jpg --template old-logo.png --text "VidiSmart" --position top-left --threshold 0.6
        """
    )
    
    parser.add_argument('--input', required=True, help='Path to input image (JPG, PNG, WebP, BMP)')
    parser.add_argument('--output', required=True, help='Path to write processed image')
    parser.add_argument('--template', required=True, help='Path to the logo template image to find')
    parser.add_argument('--text', help='Replacement text to overlay')
    parser.add_argument('--replacement-image', help='Path to a replacement logo image')
    parser.add_argument('--position', default='top-right',
                       choices=['top-left', 'top-right', 'bottom-left', 'bottom-right'],
                       help='Where to place replacement (default: top-right)')
    parser.add_argument('--threshold', type=float, default=0.5,
                       help='Match confidence threshold 0.0-1.0 (default: 0.5)')
    parser.add_argument('--scale-min', type=float, default=0.2,
                       help='Minimum scale factor for multi-scale matching (default: 0.2)')
    parser.add_argument('--scale-max', type=float, default=3.0,
                       help='Maximum scale factor (default: 3.0)')
    parser.add_argument('--scales', type=int, default=12,
                       help='Number of scales to try (default: 12)')
    parser.add_argument('--overlay-opacity', type=float, default=1.0,
                       help='Opacity for replacement overlay 0.0-1.0 (default: 1.0)')
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.text and not args.replacement_image:
        parser.error("Either --text or --replacement-image is required")
    
    if args.threshold < 0.0 or args.threshold > 1.0:
        parser.error("--threshold must be between 0.0 and 1.0")
    
    if args.scale_min <= 0 or args.scale_max <= 0:
        parser.error("--scale-min and --scale-max must be positive")
    
    if args.scale_min >= args.scale_max:
        parser.error("--scale-min must be less than --scale-max")
    
    if args.scales < 1:
        parser.error("--scales must be at least 1")
    
    if args.overlay_opacity < 0.0 or args.overlay_opacity > 1.0:
        parser.error("--overlay-opacity must be between 0.0 and 1.0")
    
    # Ensure output directory exists
    output_dir = os.path.dirname(args.output)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    
    try:
        result = process_image(args)
        print(json.dumps(result))
    except FileNotFoundError as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
    except ValueError as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Unexpected error: {str(e)}", "traceback": traceback.format_exc()}))
        sys.exit(1)


if __name__ == '__main__':
    main()
