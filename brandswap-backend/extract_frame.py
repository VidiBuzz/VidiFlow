#!/usr/bin/env python
"""
Extract a frame from a video to check if logo replacement worked
Use this to visually verify processing before batch runs
"""

import cv2
import sys
from pathlib import Path

def extract_frame(video_path: Path, frame_number: int = 1, output_path: Path = None):
    """Extract a specific frame from video"""

    if not video_path.exists():
        print(f"❌ Video not found: {video_path}")
        return False

    # Open video
    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        print(f"❌ Could not open video: {video_path}")
        return False

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    print(f"Video: {video_path.name}")
    print(f"Total frames: {total_frames}")
    print(f"FPS: {fps}")
    print(f"Duration: {total_frames/fps:.1f} seconds")

    # Set frame position
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

    # Read frame
    ret, frame = cap.read()

    if not ret:
        print(f"❌ Could not read frame {frame_number}")
        cap.release()
        return False

    # Save frame
    if output_path is None:
        output_path = video_path.parent / f"{video_path.stem}_frame_{frame_number}.jpg"

    cv2.imwrite(str(output_path), frame)
    cap.release()

    print(f"\n✅ Frame extracted!")
    print(f"Saved to: {output_path}")
    print(f"\nCheck this image to see if NotebookLM logo is still there!")

    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_frame.py <video.mp4> [frame_number]")
        print("\nExample:")
        print('  python extract_frame.py "../images/rebranded/Your_AI_Coding_Dream_Team.mp4" 1')
        print("\nThis extracts frame 1 (first frame) by default")
        sys.exit(1)

    video = Path(sys.argv[1])
    frame_num = int(sys.argv[2]) if len(sys.argv) > 2 else 1

    extract_frame(video, frame_num)
