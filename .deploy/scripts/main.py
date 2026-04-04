#!/usr/bin/env python3
"""
BrandSwap API Server
Runs on Railway, handles logo replacement requests from vidi.news
"""

import os
import uuid
import asyncio
from pathlib import Path
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import shutil

app = FastAPI(title="BrandSwap API")

# Enable CORS for vidi.news
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://vidi.news", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"
SCRIPT_DIR = BASE_DIR

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


@app.get("/")
async def root():
    return {"status": "ok", "service": "BrandSwap API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/process")
async def process_files(
    logo: UploadFile = File(...),
    files: List[UploadFile] = File(...),
    overlay_text: str = Form("VidiSmart™"),
    threshold: float = Form(0.55),
    position: str = Form("bottom-right")
):
    """Process images/videos and replace logos"""
    
    session_id = str(uuid.uuid4())
    session_upload = UPLOAD_DIR / session_id
    session_output = OUTPUT_DIR / session_id
    session_upload.mkdir(exist_ok=True)
    session_output.mkdir(exist_ok=True)
    
    try:
        # Save logo
        logo_path = session_upload / "template.jpg"
        with open(logo_path, "wb") as f:
            f.write(await logo.read())
        
        # Save media files
        media_paths = []
        for i, file in enumerate(files):
            ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
            media_path = session_upload / f"media_{i}.{ext}"
            with open(media_path, "wb") as f:
                f.write(await file.read())
            media_paths.append(media_path)
        
        # Run processing using the actual brandswap processor
        results = []
        for media_path in media_paths:
            output_name = f"output_{media_path.name}"
            output_path = session_output / output_name
            
            # Call the actual processing script
            cmd = [
                "python", str(SCRIPT_DIR / "brandswap-processor.py"),
                "--input", str(media_path),
                "--output", str(output_path),
                "--template", str(logo_path),
                "--text", overlay_text,
                "--threshold", str(threshold)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                # If processing fails, fall back to copy for now
                print(f"Processing failed: {result.stderr}")
                shutil.copy(media_path, output_path)
                status = "processed_fallback"
            else:
                status = "processed"
            
            results.append({
                "input": media_path.name,
                "output": output_name,
                "status": status,
                "url": f"/download/{session_id}/{output_name}"
            })
        
        return JSONResponse({
            "session_id": session_id,
            "results": results
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/download/{session_id}/{filename}")
async def download_file(session_id: str, filename: str):
    """Download processed file"""
    file_path = OUTPUT_DIR / session_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=filename)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
