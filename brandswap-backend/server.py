#!/usr/bin/env python
"""
BrandSwap FastAPI Backend Server
Runs locally with ffmpeg for video processing
Uploads results to Cloudflare R2
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from typing import List
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import subprocess
import uuid
import os
import json
import shutil
from pathlib import Path
import boto3
from botocore.config import Config

app = FastAPI(title="BrandSwap API")

# CORS - allow Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration - Permanent storage for production
STORAGE_ROOT = Path("./storage")
UPLOAD_DIR = STORAGE_ROOT / "uploads"
OUTPUT_DIR = STORAGE_ROOT / "output"
ARCHIVE_DIR = STORAGE_ROOT / "archive"  # For completed sessions

# Create permanent storage directories
STORAGE_ROOT.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

# R2 Configuration
R2_ACCOUNT_ID = "5830508745fd2ac063426ebf9429c22d"
R2_ACCESS_KEY = "e9c7b7eb9ea570cc59e413cfdf580deb"
R2_SECRET_KEY = "aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b"
R2_BUCKET = "vidismart"
CDN_URL = "https://cdn.vidi.news"

s3_client = boto3.client(
    's3',
    endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name='auto',
    config=Config(signature_version='s3v4')
)


def detect_logo_multiscale(image_path, template_path, threshold=0.55):
    """
    Detect logo using multi-scale template matching
    Returns: (found, confidence, bbox)
    """
    img = cv2.imread(str(image_path))
    template = cv2.imread(str(template_path))

    if img is None or template is None:
        return False, 0, None

    h, w = img.shape[:2]

    # Search in bottom-right area
    search_region = {
        "x_start": int(w * 0.70),
        "y_start": int(h * 0.85),
        "x_end": w,
        "y_end": h
    }

    roi = img[search_region["y_start"]:search_region["y_end"],
              search_region["x_start"]:search_region["x_end"]]

    best_match = 0
    best_bbox = None

    # Try multiple scales
    scales = [0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1.0]

    for scale in scales:
        new_w = int(template.shape[1] * scale)
        new_h = int(template.shape[0] * scale)

        if new_w > roi.shape[1] or new_h > roi.shape[0] or new_w < 5 or new_h < 5:
            continue

        resized_template = cv2.resize(template, (new_w, new_h))
        result = cv2.matchTemplate(roi, resized_template, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, max_loc = cv2.minMaxLoc(result)

        if max_val > best_match:
            best_match = max_val
            # Adjust coordinates to full image
            x = search_region["x_start"] + max_loc[0]
            y = search_region["y_start"] + max_loc[1]
            best_bbox = (x, y, new_w, new_h)

    if best_match >= threshold:
        return True, best_match, best_bbox

    return False, best_match, None


def create_text_overlay(width, height, text="VidiSmart™",
                        font_name="arial.ttf", font_size_percent=0.35,
                        text_color=(255, 255, 255, 255),
                        bg_color=(15, 23, 42, 255),
                        border_color=(59, 130, 246, 255),
                        shadow=True, shadow_offset=2):
    """Create customizable text overlay"""
    overlay = Image.new("RGBA", (width, height), bg_color)
    draw = ImageDraw.Draw(overlay)

    # Load font
    try:
        font_size = int(height * font_size_percent)
        font = ImageFont.truetype(font_name, font_size)
    except:
        try:
            # Fallback fonts
            font = ImageFont.truetype("arial.ttf", int(height * font_size_percent))
        except:
            font = ImageFont.load_default()

    # Get text dimensions
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center text
    x = (width - text_width) // 2
    y = (height - text_height) // 2 - 3

    # Draw shadow if enabled
    if shadow:
        shadow_color = (0, 0, 0, 128)  # Semi-transparent black
        draw.text((x + shadow_offset, y + shadow_offset), text, font=font, fill=shadow_color)

    # Draw text
    draw.text((x, y), text, font=font, fill=text_color)

    # Draw border if border color provided
    if border_color:
        draw.rectangle([0, 0, width - 1, height - 1], outline=border_color, width=2)

    return overlay


def replace_logo_in_image(image_path, output_path, bbox, overlay_config):
    """Replace detected logo with custom overlay"""
    img = Image.open(image_path)
    x, y, w, h = bbox

    # Create overlay with custom settings
    overlay = create_text_overlay(
        w, h,
        text=overlay_config.get('text', 'VidiSmart™'),
        font_name=overlay_config.get('font', 'arial.ttf'),
        font_size_percent=overlay_config.get('font_size', 0.35),
        text_color=overlay_config.get('text_color', (255, 255, 255, 255)),
        bg_color=overlay_config.get('bg_color', (15, 23, 42, 255)),
        border_color=overlay_config.get('border_color', (59, 130, 246, 255)),
        shadow=overlay_config.get('shadow', True),
        shadow_offset=overlay_config.get('shadow_offset', 2)
    )

    # Paste overlay
    img.paste(overlay, (x, y), overlay)
    img.save(output_path, quality=95)

    return output_path


def process_video(video_path, output_path, template_path, overlay_config, threshold):
    """Process video frame by frame with logo replacement"""
    cap = cv2.VideoCapture(str(video_path))

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Create temp directory for frames
    temp_dir = output_path.parent / f"frames_{uuid.uuid4().hex[:8]}"
    temp_dir.mkdir(exist_ok=True)

    # Extract and process frames
    frame_count = 0
    logo_bbox = None

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Save frame
        frame_path = temp_dir / f"frame_{frame_count:06d}.png"
        cv2.imwrite(str(frame_path), frame)

        # Detect logo in first frame or every 30 frames
        if frame_count == 0 or frame_count % 30 == 0:
            found, conf, bbox = detect_logo_multiscale(frame_path, template_path, threshold)
            if found:
                logo_bbox = bbox

        # Replace logo if detected
        if logo_bbox:
            replace_logo_in_image(frame_path, frame_path, logo_bbox, overlay_config)

        frame_count += 1

    cap.release()

    # Reassemble video with ffmpeg
    ffmpeg_cmd = [
        'ffmpeg', '-y',
        '-framerate', str(fps),
        '-i', str(temp_dir / 'frame_%06d.png'),
        '-i', str(video_path),  # Original video for audio
        '-map', '0:v',  # Video from frames
        '-map', '1:a?',  # Audio from original (if exists)
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'copy',
        str(output_path)
    ]

    subprocess.run(ffmpeg_cmd, check=True, capture_output=True)

    # Cleanup
    shutil.rmtree(temp_dir)

    return output_path


def upload_to_r2(file_path, key):
    """Upload file to Cloudflare R2"""
    with open(file_path, 'rb') as f:
        s3_client.upload_fileobj(f, R2_BUCKET, key)
    return f"{CDN_URL}/{key}"


@app.get("/")
async def root():
    return {"status": "BrandSwap API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


def parse_color(color_str: str) -> tuple:
    """Parse color string like '#FF0000' or 'rgb(255,0,0)' to (R,G,B,A) tuple"""
    try:
        if color_str.startswith('#'):
            # Hex color
            color_str = color_str.lstrip('#')
            if len(color_str) == 6:
                return tuple(int(color_str[i:i+2], 16) for i in (0, 2, 4)) + (255,)
        elif color_str.startswith('rgb'):
            # RGB color
            parts = color_str.replace('rgb(', '').replace('rgba(', '').replace(')', '').split(',')
            return tuple(int(p.strip()) for p in parts[:3]) + (255 if len(parts) < 4 else int(parts[3]))
    except:
        pass
    return (255, 255, 255, 255)  # Default white


@app.post("/api/brandswap/process")
async def process_brandswap(
    logo: UploadFile = File(...),
    files: List[UploadFile] = File(...),
    overlayText: str = Form("VidiSmart™"),
    threshold: float = Form(0.55),
    position: str = Form("bottom-right"),
    # New customization params
    fontName: str = Form("arial.ttf"),
    fontSize: float = Form(0.35),
    textColor: str = Form("#FFFFFF"),
    bgColor: str = Form("#0F172A"),
    borderColor: str = Form("#3B82F6"),
    enableShadow: bool = Form(True),
    shadowOffset: int = Form(2)
):
    """
    Process files with logo replacement and customizable overlay
    """
    session_id = str(uuid.uuid4())
    session_upload_dir = UPLOAD_DIR / session_id
    session_output_dir = OUTPUT_DIR / session_id
    session_upload_dir.mkdir(exist_ok=True)
    session_output_dir.mkdir(exist_ok=True)

    try:
        # Build overlay configuration
        overlay_config = {
            'text': overlayText,
            'font': fontName,
            'font_size': fontSize,
            'text_color': parse_color(textColor),
            'bg_color': parse_color(bgColor),
            'border_color': parse_color(borderColor) if borderColor else None,
            'shadow': enableShadow,
            'shadow_offset': shadowOffset
        }

        # Save logo template
        template_path = session_upload_dir / f"template_{logo.filename}"
        with open(template_path, "wb") as f:
            f.write(await logo.read())

        results = []

        # Process each file
        for file in files:
            file_path = session_upload_dir / file.filename
            with open(file_path, "wb") as f:
                f.write(await file.read())

            output_path = session_output_dir / file.filename

            # Determine if image or video
            ext = file.filename.lower().split('.')[-1]

            if ext in ['jpg', 'jpeg', 'png']:
                # Process image
                found, conf, bbox = detect_logo_multiscale(file_path, template_path, threshold)

                if found:
                    replace_logo_in_image(file_path, output_path, bbox, overlay_config)

                    # Upload to R2
                    r2_key = f"brandswap/{session_id}/{file.filename}"
                    cdn_url = upload_to_r2(output_path, r2_key)

                    results.append({
                        "filename": file.filename,
                        "status": "processed",
                        "confidence": round(conf, 2),
                        "cdnUrl": cdn_url
                    })
                else:
                    results.append({
                        "filename": file.filename,
                        "status": "skipped",
                        "reason": "Logo not detected"
                    })

            elif ext in ['mp4', 'mov']:
                # Process video
                try:
                    process_video(file_path, output_path, template_path, overlay_config, threshold)

                    # Upload to R2
                    r2_key = f"brandswap/{session_id}/{file.filename}"
                    cdn_url = upload_to_r2(output_path, r2_key)

                    results.append({
                        "filename": file.filename,
                        "status": "processed",
                        "cdnUrl": cdn_url
                    })
                except Exception as e:
                    results.append({
                        "filename": file.filename,
                        "status": "error",
                        "reason": str(e)
                    })

        return JSONResponse({
            "success": True,
            "sessionId": session_id,
            "results": results
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("Starting BrandSwap Backend Server...")
    print("Local: http://localhost:8080")
    print("API Docs: http://localhost:8080/docs")
    uvicorn.run(app, host="0.0.0.0", port=8080)
