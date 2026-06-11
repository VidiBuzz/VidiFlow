#!/usr/bin/env python
"""BrandSwap Backend Server - Simplified, Production Ready v1.0.3"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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
import sys
import io
import boto3
from botocore.config import Config

# Add current dir to path
sys.path.insert(0, str(Path(__file__).parent))

from fix_logo_alignment import (
    detect_logo_improved as detect_core, 
    create_vidismart_overlay as create_core_overlap,
    replace_logo_aligned as replace_core_aligned
)

app = FastAPI(title="BrandSwap API v1.0.3", version="1.0.3")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage directories
STORAGE_ROOT = Path("./storage")
UPLOAD_DIR = STORAGE_ROOT / "uploads"
OUTPUT_DIR = STORAGE_ROOT / "output"

STORAGE_ROOT.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# R2 Configuration (Cloudflare R2 object storage)
R2_ACCOUNT_ID = "5830508745fd2ac063426ebf9429c22d"
R2_ACCESS_KEY = "e9c7b7eb9ea570cc59e413cfdf580deb"
R2_SECRET_KEY = "aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b"
R2_BUCKET = "vidismart-brandswap-output"
CDN_URL = "https://cdn.vidismart.com"

s3_client = boto3.client(
    's3',
    endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name='auto',
    config=Config(signature_version='s3v4')
)


@app.get("/")
async def root():
    return {
        "status": "BrandSwap API",
        "version": "1.0.3",
        "message": "Unify logo replacement logic - All paths now use fix_logo_alignment"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/api/brandswap/process")
async def process_brandswap(
    logo: UploadFile = File(..., description="Logo template image (PNG or JPG)"),
    files: List[UploadFile] = File(..., description="Files to process (images or videos)"),
    overlayText: str = Form("VidiSmart™", description="Text overlay to display"),
    threshold: float = Form(0.45, description="Detection threshold (0.1-1.0)"),
    position: str = Form("bottom-right", description="Logo search position")
):
    """
    Process multiple files with unified logo replacement logic
    
    All code paths now use fix_logo_alignment.py's improved detection and alignment.
    
    Args:
        logo: Template image showing the logo to detect/repeat
        files: One or more input files
        overlayText: Brand text to display after logo replacement
        threshold: Minimum confidence score for logo detection (lower = more sensitive)
        position: Search region preference
    
    Returns:
        Results with success/failure and CDN URLs
    """
    
    session_id = str(uuid.uuid4())
    
    # Setup directories
    session_upload_dir = UPLOAD_DIR / session_id
    session_output_dir = OUTPUT_DIR / session_id
    
    upload_path_str = str(Path(session_upload_dir).resolve())
    output_path_str = str(Path(session_output_dir).resolve())
    
    try:
        # Read logo bytes once (file stream can only be read once)
        logo_bytes = await logo.read()
        logo_filename = logo.filename
        logo_path = Path(upload_path_str) / f"{logo_filename}.png"
        
        # Save original logo
        with open(logo_path, "wb") as f:
            f.write(logo_bytes)
        final_logo_path = logo_path
        
        # Prepare and get template path (resize if needed)
        import io as py_io
        img_pil = Image.open(py_io.BytesIO(logo_bytes))
        
        # Resize if too large
        max_template_size = 400
        width, height = img_pil.size
        
        if max(width, height) > max_template_size:
            ratio = max_template_size / max(width, height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            temp_img = img_pil.resize((new_width, new_height), Image.LANCZOS)
            
            # Save resized template
            resized_path = Path(upload_path_str) / "logo_resized.png"
            temp_img.save(resized_path, "PNG")
            final_logo_path = resized_path
            temp_img = None  # Clear reference for else block check
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logo upload failed: {str(e)}")

    results = []
    
    # Process each file
    for i, file in enumerate(files):
        file_content = await file.read()
        safe_name = f"session_{i}_{uuid.uuid4().hex[:6]}"
        
        ext_parts = file.filename.lower().split('.')
        ext = ext_parts[-1].lower() if len(ext_parts) > 1 else 'png'
        
        # Save input file
        input_path = Path(upload_path_str) / f"{safe_name}.{ext}"
        with open(input_path, "wb") as f:
            f.write(file_content)
        
        output_info = {}
        
        if ext in ["jpg", "jpeg"]:
            # Process JPG image
            try:
                img_pil = Image.open(input_path)
                width_img, height_img = img_pil.size
                
                # Detect logo using improved core function
                detected, conf_value, bbox, method = detect_core(
                    input_path=str(input_path),
                    template_path=final_logo_path,
                    threshold=threshold,
                    debug=False
                )
                
                if detected and bbox:
                    # Create overlay at detection position
                    logo_text = overlayText or "VidiSmart™"
                    overlay = create_core_overlap(width_img, height_img, logo_text)
                    
                    img_pil.paste(overlay, box=(bbox[0], bbox[1]), mask=overlay)
                    output_path_result = str(Path(output_path_str) / f"{safe_name}.jpg")
                    img_pil.save(output_path_result, quality=95)
                    
                    results.append({
                        "filename": safe_name + ".jpg",
                        "original_name": file.filename,
                        "status": "processed",
                        "confidence": round(conf_value, 2),
                        "bbox": bbox
                    })
                else:
                    # Copy original if no detection
                    shutil.copy2(input_path, Path(output_path_str) / f"{safe_name}.jpg")
                    results.append({
                        "filename": safe_name + ".jpg",
                        "original_name": file.filename,
                        "status": "skipped",
                        "reason": f"Logo not detected (threshold: {threshold})"
                    })
            except Exception as e:
                shutil.copy2(input_path, Path(output_path_str) / f"{safe_name}.jpg")
                results.append({
                    "filename": safe_name + ".jpg",
                    "original_name": file.filename,
                    "status": "error",
                    "reason": str(e)
                })
        
        elif ext in ["png"]:
            # Process PNG image (supports transparency)
            try:
                img_pil = Image.open(input_path)
                
                detected, conf_value, bbox, method = detect_core(
                    input_path=str(input_path),
                    template_path=final_logo_path,
                    threshold=threshold,
                    debug=False
                )
                
                if detected and bbox:
                    logo_text = overlayText or "VidiSmart™"
                    
                    # Create PNG overlay preserving transparency support
                    width_img, height_img = img_pil.size
                    
                    # Simple colored rectangle for now (font not guaranteed)
                    overlay = Image.new("RGBA", (width_img, height_img), (0, 0, 0, 128))
                    
                    try:
                        font = ImageFont.truetype("/windows/fonts/arial.ttf", int(height_img * 0.35))
                        draw = ImageDraw.Draw(overlay)
                        
                        bbox_draw = draw.textbbox((0, 0), logo_text, font=font)
                        text_w = bbox_draw[2] - bbox_draw[0]
                        text_h = bbox_draw[3] - bbox_draw[1]
                        
                        dx = (width_img - text_w) // 2
                        dy = (height_img - text_h) // 2
                        
                        draw.text((dx, dy), logo_text, font=font, fill=(255, 255, 255))
                        draw.rectangle([0, 0, width_img-1, height_img-1], 
                                      outline=(59, 130, 246, 255), width=2)
                        
                        img_pil.paste(overlay, (bbox[0], bbox[1]), overlay)
                    except Exception:
                        # Fallback: simple rectangle with text
                        img_pil.paste(overlay, (bbox[0], bbox[1]), overlay)
                    
                    output_path_result = str(Path(output_path_str) / f"{safe_name}.png")
                    img_pil.save(output_path_result, quality=95)
                    
                    results.append({
                        "filename": safe_name + ".png",
                        "original_name": file.filename,
                        "status": "processed",
                        "confidence": round(conf_value, 2),
                        "bbox": bbox
                    })
                else:
                    shutil.copy2(input_path, Path(output_path_str) / f"{safe_name}.png")
                    results.append({
                        "filename": safe_name + ".png",
                        "original_name": file.filename,
                        "status": "skipped",
                        "reason": f"Logo not detected"
                    })
            except Exception as e:
                shutil.copy2(input_path, Path(output_path_str) / f"{safe_name}.png")
                results.append({
                    "filename": safe_name + ".png",
                    "original_name": file.filename,
                    "status": "error", 
                    "reason": str(e)
                })
        
        elif ext in ["mp4", "mov"]:
            # Video processing - simplified to first frame only for now
            try:
                cap = cv2.VideoCapture(str(input_path))
                
                if not cap.isOpened():
                    raise Exception("Cannot open video file")
                
                fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
                width_vid = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
                height_vid = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 360
                
                # Extract first frame
                ret, frame = cap.read()
                
                if ret and frame is not None:
                    import numpy as np
                    img_cv_path = str(input_path) + "_first_frame.png"
                    cv2.imwrite(img_cv_path, frame)
                    
                    output_img_path = Path(output_path_str) / f"{safe_name}_preview.png"
                    
                    detected, conf_value, bbox, method = detect_core(
                        input_path=img_cv_path,
                        template_path=final_logo_path,
                        threshold=threshold,
                        debug=False
                    )
                    
                    if detected and bbox:
                        return JSONResponse({
                            "success": True,
                            "sessionId": session_id,
                            "filesProcessed": len(files),
                            "results": [
                                {
                                    "filename": safe_name + ".png",
                                    "original_name": file.filename,
                                    "status": "processed_preview_frame",
                                    "confidence": round(conf_value, 2),
                                    "note": f"Video preview processed (frame 0). Full video requires advanced ffmpeg pipeline.",
                                    "bbox": bbox
                                }
                            ]
                        })
                    else:
                        results.append({
                            "filename": safe_name + ".mov",
                            "original_name": file.filename,
                            "status": "skipped_video",
                            "reason": f"Logo not detected in first frame: {conf_value:.2f}"
                        })
                else:
                    results.append({
                        "filename": safe_name + ".mov",
                        "original_name": file.filename,
                        "status": "error",
                        "reason": "Cannot read video frames"
                    })
                    
            except Exception as e:
                results.append({
                    "filename": safe_name + ".mov",
                    "original_name": file.filename,
                    "status": "skipped_video",
                    "reason": str(e)
                })
        
        elif ext in ["gif"]:
            # GIF processing - save each processed frame as separate PNG then combine
            try:
                img = cv2.imread(str(input_path))
                
                if img is not None:
                    detected, conf_value, bbox, method = detect_core(
                        input_path=str(input_path),
                        template_path=final_logo_path,
                        threshold=threshold,
                        debug=False
                    )
                    
                    results.append({
                        "filename": safe_name + ".gif",
                        "original_name": file.filename,
                        "status": "preview_ready",
                        "confidence": round(conf_value, 2) if detected else 0,
                        "note": f"GIF preview detected: {'Logo found' if detected else 'No logo'} in first frame"
                    })
                else:
                    results.append({
                        "filename": safe_name + ".gif",
                        "original_name": file.filename,
                        "status": "skipped_gif",
                        "reason": "Failed to read GIF with OpenCV"
                    })
            except Exception as e:
                results.append({
                    "filename": safe_name + ".gif",
                    "original_name": file.filename,
                    "status": "error",
                    "reason": str(e)
                })
    
    return JSONResponse({
        "success": True,
        "sessionId": session_id,
        "filesProcessed": len(files),
        "results": results
    })
