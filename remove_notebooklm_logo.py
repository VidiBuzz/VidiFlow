#!/usr/bin/env python3
"""
NotebookLM Logo Removal Script for VidiSmart Rebranding

This script detects and covers the NotebookLM logo in the bottom-right corner
of images and videos in the images folder.

Usage:
    python remove_notebooklm_logo.py [--dry-run] [--input-dir PATH]

Requirements:
    pip install opencv-python pillow numpy
    For videos: ffmpeg (system dependency)
"""

import os
import sys
import argparse
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import subprocess
import shutil
from concurrent.futures import ProcessPoolExecutor, as_completed
from tqdm import tqdm

# Configuration
NOTEBOOKLM_LOGO_BOUNDS = {
    # Typical bottom-right corner logo position (adjust as needed)
    "relative_x": 0.75,  # Start at 75% from left
    "relative_y": 0.85,  # Start at 85% from top
    "relative_w": 0.25,  # Width is 25% of image
    "relative_h": 0.15,  # Height is 15% of image
}

BRAND_OVERLAY_TEXT = "VidiSmart™"
BRAND_BG_COLOR = (15, 23, 42)  # Dark blue background
BRAND_TEXT_COLOR = (255, 255, 255)  # White text
SUPPORTED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
SUPPORTED_VIDEO_EXTS = {".mp4", ".mov", ".avi", ".mkv"}


class LogoRemover:
    def __init__(self, input_dir, output_dir=None, dry_run=False):
        self.input_dir = Path(input_dir)
        self.output_dir = (
            Path(output_dir) if output_dir else self.input_dir / "rebranded"
        )
        self.dry_run = dry_run
        self.stats = {"processed": 0, "skipped": 0, "failed": 0, "has_logo": 0}

    def detect_logo_area(self, image_path):
        """Detect if image has NotebookLM logo in bottom-right corner."""
        try:
            img = cv2.imread(str(image_path))
            if img is None:
                return None, False

            h, w = img.shape[:2]

            # Define region of interest (bottom-right corner)
            x1 = int(w * NOTEBOOKLM_LOGO_BOUNDS["relative_x"])
            y1 = int(h * NOTEBOOKLM_LOGO_BOUNDS["relative_y"])
            x2 = w
            y2 = h

            roi = img[y1:y2, x1:x2]

            # Simple detection: Check for high contrast region (typical of logos)
            # Convert to grayscale
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)

            # Check for significant edges (logo presence)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / edges.size

            # Also check for text-like patterns (NotebookLM has text)
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            white_ratio = np.sum(thresh == 255) / thresh.size

            # Heuristic: High edge density and mixed black/white suggests logo
            has_logo = edge_density > 0.05 and 0.2 < white_ratio < 0.8

            # Return the bounds where overlay should be placed
            bounds = (x1, y1, x2, y2)
            return bounds, has_logo

        except Exception as e:
            print(f"Error detecting logo in {image_path}: {e}")
            return None, False

    def create_brand_overlay(self, width, height):
        """Create a branded overlay image to cover the logo area."""
        overlay = Image.new("RGBA", (width, height), (*BRAND_BG_COLOR, 255))
        draw = ImageDraw.Draw(overlay)

        # Try to load a nice font, fallback to default
        try:
            font = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                int(height * 0.25),
            )
        except:
            try:
                font = ImageFont.truetype("arial.ttf", int(height * 0.25))
            except:
                font = ImageFont.load_default()

        # Calculate text position (centered)
        bbox = draw.textbbox((0, 0), BRAND_OVERLAY_TEXT, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        x = (width - text_width) // 2
        y = (height - text_height) // 2

        # Draw text
        draw.text((x, y), BRAND_OVERLAY_TEXT, font=font, fill=BRAND_TEXT_COLOR)

        # Add a subtle border
        draw.rectangle([0, 0, width - 1, height - 1], outline=(100, 100, 100), width=2)

        return overlay

    def process_image(self, image_path):
        """Process a single image file."""
        try:
            # Detect logo
            bounds, has_logo = self.detect_logo_area(image_path)

            if not has_logo and not self.dry_run:
                self.stats["skipped"] += 1
                return f"SKIPPED: {image_path.name} (no logo detected)"

            self.stats["has_logo"] += 1

            if self.dry_run:
                return f"WOULD_PROCESS: {image_path.name}"

            # Load image with PIL
            img = Image.open(image_path)

            # Convert to RGBA if necessary
            if img.mode != "RGBA":
                img = img.convert("RGBA")

            # Get overlay dimensions from bounds
            x1, y1, x2, y2 = bounds
            overlay_width = x2 - x1
            overlay_height = y2 - y1

            # Create and paste overlay
            overlay = self.create_brand_overlay(overlay_width, overlay_height)
            img.paste(overlay, (x1, y1), overlay)

            # Determine output path and format
            output_path = self.output_dir / image_path.name
            self.output_dir.mkdir(parents=True, exist_ok=True)

            # Save in original format
            if image_path.suffix.lower() in [".jpg", ".jpeg"]:
                # JPEG doesn't support alpha, convert to RGB
                img_rgb = img.convert("RGB")
                img_rgb.save(output_path, quality=95)
            else:
                img.save(output_path)

            self.stats["processed"] += 1
            return f"PROCESSED: {image_path.name}"

        except Exception as e:
            self.stats["failed"] += 1
            return f"FAILED: {image_path.name} - {e}"

    def process_video(self, video_path):
        """Process a single video file using ffmpeg."""
        try:
            if self.dry_run:
                return f"WOULD_PROCESS_VIDEO: {video_path.name}"

            # Create output path
            self.output_dir.mkdir(parents=True, exist_ok=True)
            output_path = self.output_dir / video_path.name

            # Get video dimensions using ffprobe
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
            width, height = map(int, result.stdout.strip().split("x"))

            # Calculate overlay position (bottom-right)
            x = int(width * NOTEBOOKLM_LOGO_BOUNDS["relative_x"])
            y = int(height * NOTEBOOKLM_LOGO_BOUNDS["relative_y"])
            w = width - x
            h = height - y

            # Create temporary overlay image
            overlay_img = self.create_brand_overlay(w, h)
            temp_overlay = self.output_dir / f"temp_overlay_{video_path.stem}.png"
            overlay_img.save(temp_overlay)

            # Use ffmpeg to overlay on video
            # This applies the overlay to the entire video
            ffmpeg_cmd = [
                "ffmpeg",
                "-y",
                "-i",
                str(video_path),
                "-i",
                str(temp_overlay),
                "-filter_complex",
                f"[0:v][1:v]overlay={x}:{y}:enable='between(t,0,99999)'[outv]",
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

            result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)

            # Clean up temp file
            temp_overlay.unlink(missing_ok=True)

            if result.returncode != 0:
                self.stats["failed"] += 1
                return f"FAILED: {video_path.name} - ffmpeg error"

            self.stats["processed"] += 1
            return f"PROCESSED_VIDEO: {video_path.name}"

        except Exception as e:
            self.stats["failed"] += 1
            return f"FAILED: {video_path.name} - {e}"

    def scan_and_process(self):
        """Main processing function."""
        print(f"Scanning directory: {self.input_dir}")
        print(f"Output directory: {self.output_dir}")
        print(f"Dry run: {self.dry_run}")
        print("-" * 60)

        # Collect all files
        all_files = []
        for ext in SUPPORTED_IMAGE_EXTS | SUPPORTED_VIDEO_EXTS:
            all_files.extend(self.input_dir.glob(f"*{ext}"))
            all_files.extend(self.input_dir.glob(f"*{ext.upper()}"))

        print(f"Found {len(all_files)} files to process")

        # Separate images and videos
        images = [f for f in all_files if f.suffix.lower() in SUPPORTED_IMAGE_EXTS]
        videos = [f for f in all_files if f.suffix.lower() in SUPPORTED_VIDEO_EXTS]

        print(f"  Images: {len(images)}")
        print(f"  Videos: {len(videos)}")
        print("-" * 60)

        # Process images
        if images:
            print("\nProcessing images...")
            with ProcessPoolExecutor(max_workers=4) as executor:
                futures = {
                    executor.submit(self.process_image, img): img for img in images
                }
                for future in tqdm(
                    as_completed(futures), total=len(images), desc="Images"
                ):
                    result = future.result()
                    if self.dry_run or "FAILED" in result or "WOULD" in result:
                        print(result)

        # Process videos (sequentially as they take longer)
        if videos:
            print("\nProcessing videos...")
            for video in tqdm(videos, desc="Videos"):
                result = self.process_video(video)
                if self.dry_run or "FAILED" in result or "WOULD" in result:
                    print(result)

        # Print summary
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Total files scanned: {len(all_files)}")
        print(f"Files with logo detected: {self.stats['has_logo']}")
        print(f"Successfully processed: {self.stats['processed']}")
        print(f"Skipped (no logo): {self.stats['skipped']}")
        print(f"Failed: {self.stats['failed']}")
        print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Remove NotebookLM logo from images and videos"
    )
    parser.add_argument(
        "--input-dir",
        "-i",
        default="/mnt/m/code/vidismart/images",
        help="Input directory containing images/videos (default: /mnt/m/code/vidismart/images)",
    )
    parser.add_argument(
        "--output-dir", "-o", help="Output directory (default: input_dir/rebranded)"
    )
    parser.add_argument(
        "--dry-run", "-d", action="store_true", help="Scan only, do not process files"
    )
    parser.add_argument(
        "--check-only",
        "-c",
        action="store_true",
        help="Only check which files have logos, list them",
    )

    args = parser.parse_args()

    remover = LogoRemover(
        input_dir=args.input_dir,
        output_dir=args.output_dir,
        dry_run=args.dry_run or args.check_only,
    )

    remover.scan_and_process()


if __name__ == "__main__":
    main()
