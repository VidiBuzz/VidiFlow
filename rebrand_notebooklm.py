#!/usr/bin/env python3
"""
NotebookLM Logo Detection and Replacement Script
Specifically targets the NotebookLM logo in bottom-right corner
"""

import cv2
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys
import subprocess

# Paths
NOTEBOOKLM_TEMPLATE = Path("/mnt/m/+Proj/VidiSmart/NotebookLM.jpg")
VIDICRM_LOGO = Path("/mnt/m/code/vidismart/vidicrm_logo.png")
IMAGES_DIR = Path("/mnt/m/code/vidismart/images")
OUTPUT_DIR = IMAGES_DIR / "rebranded"

# Detection settings
MATCH_THRESHOLD = (
    0.55  # Template match confidence (0-1) - Lowered to catch smaller logos
)
SEARCH_REGION = {
    "x_start": 0.65,  # Start search at 65% from left (expanded)
    "y_start": 0.88,  # Start search at 88% from top (adjusted)
    "width": 0.35,  # Search 35% of width (expanded)
    "height": 0.12,  # Search 12% of height
}

# Overlay padding settings - ensures full logo coverage
OVERLAY_PADDING = {
    "left": 10,      # pixels to extend left
    "right": 20,     # pixels to extend right (to edge)
    "top": 8,        # pixels to extend up
    "bottom": 8,     # pixels to extend down
}


def create_vidismart_overlay(width, height):
    """Create VidiCRM branded overlay using the PNG template."""
    try:
        # Load the VidiCRM logo template
        logo_img = Image.open(VIDICRM_LOGO)
        
        # Scale to requested dimensions while maintaining aspect ratio
        logo_aspect = logo_img.width / logo_img.height
        target_aspect = width / height
        
        if logo_aspect > target_aspect:
            new_h = height - 10
            new_w = int(new_h * logo_aspect)
        else:
            new_w = width - 20
            new_h = int(new_w / logo_aspect)
        
        scaled_logo = logo_img.resize((new_w, new_h), Image.LANCZOS)
        
        # Create transparent background with the scaled logo centered
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        paste_x = (width - new_w) // 2
        paste_y = (height - new_h) // 2
        overlay.paste(scaled_logo, (paste_x, paste_y), scaled_logo)
        
        return overlay
    except Exception as e:
        print(f"Warning: Could not load VidiCRM logo template: {e}")
        # Fallback to text-based overlay
        overlay = Image.new("RGBA", (width, height), (15, 23, 42, 255))
        draw = ImageDraw.Draw(overlay)
        
        try:
            font_large = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(height * 0.35)
            )
        except:
            font_large = ImageFont.load_default()
        
        text = "VidiCRM"
        bbox = draw.textbbox((0, 0), text, font=font_large)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        draw.text((x, y), text, font=font_large, fill=(255, 255, 255, 255))
        
        return overlay


def detect_notebooklm_logo(image_path, template):
    """
    Specifically detect NotebookLM logo in bottom-right corner.
    Returns: (has_logo, confidence, logo_bounds)
    """
    try:
        # Load image
        img = cv2.imread(str(image_path))
        if img is None:
            return False, 0, None

        h, w = img.shape[:2]

        # Define search region (bottom-right corner)
        x1 = int(w * SEARCH_REGION["x_start"])
        y1 = int(h * SEARCH_REGION["y_start"])
        x2 = min(w, int(x1 + w * SEARCH_REGION["width"]))
        y2 = min(h, int(y1 + h * SEARCH_REGION["height"]))

        search_roi = img[y1:y2, x1:x2]

        # Try template matching at multiple scales
        # NotebookLM logo appears very small in most exported images
        best_match = 0
        best_scale = 1.0

        scales = [0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1.0]

        for scale in scales:
            # Resize template
            new_w = int(template.shape[1] * scale)
            new_h = int(template.shape[0] * scale)

            if new_w > search_roi.shape[1] or new_h > search_roi.shape[0]:
                continue

            resized_template = cv2.resize(template, (new_w, new_h))

            # Template matching
            result = cv2.matchTemplate(
                search_roi, resized_template, cv2.TM_CCOEFF_NORMED
            )
            _, max_val, _, max_loc = cv2.minMaxLoc(result)

            if max_val > best_match:
                best_match = max_val
                best_scale = scale

        # Check if match is good enough
        if best_match >= MATCH_THRESHOLD:
            # Calculate actual logo position in full image
            logo_w = int(template.shape[1] * best_scale)
            logo_h = int(template.shape[0] * best_scale)

            # Re-run to get exact position
            result = cv2.matchTemplate(
                search_roi, cv2.resize(template, (logo_w, logo_h)), cv2.TM_CCOEFF_NORMED
            )
            _, _, _, max_loc = cv2.minMaxLoc(result)

            logo_bounds = (
                x1 + max_loc[0],  # absolute x
                y1 + max_loc[1],  # absolute y
                x1 + max_loc[0] + logo_w,  # absolute x2
                y1 + max_loc[1] + logo_h,  # absolute y2
            )

            return True, best_match, logo_bounds

        return False, best_match, None

    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return False, 0, None


def process_image(image_path, template, dry_run=False):
    """Process a single image - PRESERVES EXACT DIMENSIONS."""
    has_logo, confidence, bounds = detect_notebooklm_logo(image_path, template)

    if not has_logo:
        return f"SKIPPED: {image_path.name} (no logo, conf: {confidence:.2f})"

    if dry_run:
        return f"WOULD_PROCESS: {image_path.name} (confidence: {confidence:.2f})"

    try:
        # Get original dimensions
        original_img = Image.open(image_path)
        original_size = original_img.size  # (width, height)
        original_mode = original_img.mode

        # Load with PIL for processing - ensure we maintain exact size
        img = Image.open(image_path)
        if img.mode != "RGBA":
            img = img.convert("RGBA")

        # Create overlay with padding to ensure full logo coverage
        logo_w = bounds[2] - bounds[0]
        logo_h = bounds[3] - bounds[1]
        
        # Apply padding to overlay dimensions
        overlay_w = logo_w + OVERLAY_PADDING["left"] + OVERLAY_PADDING["right"]
        overlay_h = logo_h + OVERLAY_PADDING["top"] + OVERLAY_PADDING["bottom"]
        
        # Ensure overlay doesn't exceed image bounds
        img_w, img_h = img.size
        paste_x = max(0, bounds[0] - OVERLAY_PADDING["left"])
        paste_y = max(0, bounds[1] - OVERLAY_PADDING["top"])
        
        # Adjust overlay size if it would go past image edge
        overlay_w = min(overlay_w, img_w - paste_x)
        overlay_h = min(overlay_h, img_h - paste_y)
        
        # Extend to right edge if logo is near edge
        if bounds[2] > img_w * 0.9:  # If logo is within 10% of right edge
            overlay_w = img_w - paste_x
        
        overlay = create_vidismart_overlay(overlay_w, overlay_h)

        # Paste overlay with padding
        img.paste(overlay, (paste_x, paste_y), overlay)

        # Save - maintain subdirectory structure
        relative_path = image_path.relative_to(IMAGES_DIR)
        output_path = OUTPUT_DIR / relative_path
        output_path.parent.mkdir(parents=True, exist_ok=True)

        if image_path.suffix.lower() in [".jpg", ".jpeg"]:
            img.convert("RGB").save(output_path, quality=95)
        else:
            img.save(output_path)

        # VERIFY: Check output dimensions match input exactly
        output_img = Image.open(output_path)
        if output_img.size != original_size:
            return f"ERROR: {image_path.name} - Size mismatch! Input: {original_size}, Output: {output_img.size}"

        return f"PROCESSED: {image_path.name} (confidence: {confidence:.2f}, size: {original_size[0]}x{original_size[1]})"

    except Exception as e:
        return f"FAILED: {image_path.name} - {e}"


def process_video(video_path, template, dry_run=False):
    """Process a video using ffmpeg - PRESERVES EXACT DIMENSIONS."""
    try:
        # Get original video dimensions
        probe_cmd = [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-of",
            "csv=s=x:p=0",
            str(video_path),
        ]
        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            return f"SKIPPED: {video_path.name} (cannot probe)"

        original_w, original_h = map(int, result.stdout.strip().split("x"))
        original_size = (original_w, original_h)

        # Get video duration for end-tag overlay
        duration_cmd = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ]
        duration_result = subprocess.run(duration_cmd, capture_output=True, text=True)
        if duration_result.returncode == 0:
            video_duration = float(duration_result.stdout.strip())
        else:
            video_duration = 0

        # Check if logo would be in typical position
        x1 = int(original_w * SEARCH_REGION["x_start"])
        y1 = int(original_h * SEARCH_REGION["y_start"])

        # Estimate logo size with padding for full coverage
        logo_w = int(original_w * 0.18)  # Increased from 15% to 18% for better coverage
        logo_h = int(logo_w * (template.shape[0] / template.shape[1]))
        
        # Apply padding to ensure full coverage
        overlay_w = logo_w + OVERLAY_PADDING["left"] + OVERLAY_PADDING["right"]
        overlay_h = logo_h + OVERLAY_PADDING["top"] + OVERLAY_PADDING["bottom"]
        
        # Adjust position with padding
        paste_x = max(0, x1 - OVERLAY_PADDING["left"])
        paste_y = max(0, y1 - OVERLAY_PADDING["top"])
        
        # Extend to right edge
        overlay_w = min(overlay_w, original_w - paste_x)

        # Calculate overlay time range (last 5 seconds)
        overlay_start = max(0, video_duration - 5) if video_duration > 0 else 0
        overlay_end = video_duration if video_duration > 0 else 0

        if dry_run:
            return f"WOULD_PROCESS: {video_path.name} (video, {original_w}x{original_h}, logo at {paste_x},{paste_y}, end-tag: {overlay_start:.1f}s-{overlay_end:.1f}s)"

        # Create overlay with padding
        overlay_img = create_vidismart_overlay(overlay_w, overlay_h)
        temp_overlay = OUTPUT_DIR / f"temp_overlay_{video_path.stem}.png"
        overlay_img.save(temp_overlay)

        # Process video - maintain subdirectory structure
        relative_path = video_path.relative_to(IMAGES_DIR)
        output_path = OUTPUT_DIR / relative_path
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # ffmpeg command with explicit output dimensions preservation
        ffmpeg_cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(video_path),
            "-i",
            str(temp_overlay),
            "-filter_complex",
            f"[0:v][1:v]overlay={paste_x}:{paste_y}:enable='between(t,{max(0, video_duration-5)},{video_duration})'[outv]",
            "-map",
            "[outv]",
            "-map",
            "0:a?",
            "-c:v",
            "libx264",
            "-crf",
            "23",
            "-preset",
            "medium",
            "-c:a",
            "copy",
            str(output_path),
        ]

        result = subprocess.run(ffmpeg_cmd, capture_output=True)
        temp_overlay.unlink(missing_ok=True)

        if result.returncode != 0:
            return f"FAILED: {video_path.name} - ffmpeg error"

        # VERIFY: Check output video dimensions match input exactly
        probe_cmd_out = [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-of",
            "csv=s=x:p=0",
            str(output_path),
        ]
        result_out = subprocess.run(probe_cmd_out, capture_output=True, text=True)
        if result_out.returncode == 0:
            out_w, out_h = map(int, result_out.stdout.strip().split("x"))
            if (out_w, out_h) != original_size:
                return f"ERROR: {video_path.name} - Size mismatch! Input: {original_size}, Output: {(out_w, out_h)}"

        return f"PROCESSED: {video_path.name} (video, {original_w}x{original_h})"

    except Exception as e:
        return f"FAILED: {video_path.name} - {e}"


def parse_args():
    """Parse command line arguments."""
    import argparse

    parser = argparse.ArgumentParser(
        description="NotebookLM Logo Detection & Replacement"
    )
    parser.add_argument("--input", "-i", help="Input directory path")
    parser.add_argument("--output", "-o", help="Output directory path")
    parser.add_argument("--template", "-t", help="Template image path")
    parser.add_argument(
        "--threshold", type=float, default=0.55, help="Detection threshold (0-1)"
    )
    parser.add_argument("--text", default="VidiSmart™", help="Overlay text")
    parser.add_argument("--json", action="store_true", help="Output JSON format")
    parser.add_argument("--dry-run", "-d", action="store_true", help="Preview only")
    return parser.parse_args()


def main():
    args = parse_args()

    # Use command line args or defaults
    input_dir = Path(args.input) if args.input else IMAGES_DIR
    output_dir = Path(args.output) if args.output else OUTPUT_DIR
    template_path = Path(args.template) if args.template else NOTEBOOKLM_TEMPLATE
    threshold = args.threshold
    overlay_text = args.text
    dry_run = args.dry_run
    json_output = args.json

    if not json_output:
        print("NotebookLM Logo Detection & Replacement")
        print("=" * 60)
        print(f"Template: {template_path}")
        print(f"Input: {input_dir}")
        print(f"Output: {output_dir}")
        print(f"Mode: {'DRY RUN (preview only)' if dry_run else 'LIVE PROCESSING'}")
        print("=" * 60)

    # Load template
    if not template_path.exists():
        error_msg = f"ERROR: Template not found: {template_path}"
        if json_output:
            import json

            print(json.dumps({"error": error_msg}))
        else:
            print(error_msg)
        sys.exit(1)

    template = cv2.imread(str(template_path))
    if template is None:
        error_msg = "ERROR: Cannot load template image"
        if json_output:
            import json

            print(json.dumps({"error": error_msg}))
        else:
            print(error_msg)
        sys.exit(1)

    if not json_output:
        print(f"Template loaded: {template.shape}")
        print()

    # Find all media files recursively
    exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".mp4", ".mov", ".avi"}
    files = []
    for ext in exts:
        files.extend(input_dir.rglob(f"*{ext}"))
        files.extend(input_dir.rglob(f"*{ext.upper()}"))

    files = [f for f in files if f.is_file()]

    if not json_output:
        print(f"Found {len(files)} files to scan")
        print("-" * 60)

    # Process files
    results = []
    for i, file_path in enumerate(sorted(files), 1):
        if file_path.suffix.lower() in {".mp4", ".mov", ".avi"}:
            result = process_video(file_path, template, dry_run)
        else:
            result = process_image(file_path, template, dry_run)

        results.append(
            {
                "filename": file_path.name,
                "result": result,
                "status": "processed"
                if "PROCESSED" in result
                else "skipped"
                if "SKIPPED" in result
                else "failed",
            }
        )

        if not json_output:
            # Print every result
            status = (
                "✓" if "PROCESSED" in result else "○" if "SKIPPED" in result else "?"
            )
            print(f"{i:3d}. {status} {result}")

    # Output results
    if json_output:
        import json

        processed = sum(1 for r in results if r["status"] == "processed")
        skipped = sum(1 for r in results if r["status"] == "skipped")
        failed = sum(1 for r in results if r["status"] == "failed")

        output = {
            "success": True,
            "summary": {
                "total": len(files),
                "processed": processed,
                "skipped": skipped,
                "failed": failed,
            },
            "results": results,
        }
        print(json.dumps(output))
    else:
        # Summary
        print("-" * 60)
        processed = sum(1 for r in results if "PROCESSED" in r["result"])
        skipped = sum(1 for r in results if "SKIPPED" in r["result"])
        failed = sum(1 for r in results if "FAILED" in r["result"])

        print(f"\nSUMMARY:")
        print(f"  Files with NotebookLM logo: {processed}")
        print(f"  Files without logo: {skipped}")
        print(f"  Errors: {failed}")

        if dry_run and processed > 0:
            print(f"\nTo actually process these files, run without --dry-run flag")


if __name__ == "__main__":
    main()
