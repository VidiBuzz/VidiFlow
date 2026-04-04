#!/usr/bin/env python3
"""
BrandSwap - Video Processing Agent
Handles video processing with ffmpeg, ensuring proper dimension preservation and audio handling.
"""

import subprocess
import tempfile
from pathlib import Path
from PIL import Image


class VideoProcessingAgent:
    """Agent responsible for video processing with ffmpeg."""
    
    def __init__(self, padding_config=None):
        """
        Initialize the Video Processing Agent.
        
        Args:
            padding_config: Dict with left, right, top, bottom padding values
        """
        self.padding_config = padding_config or {
            "left": 10,
            "right": 20,
            "top": 8,
            "bottom": 8
        }
        self.ffmpeg_path = self._find_ffmpeg()
    
    def _find_ffmpeg(self):
        """Find ffmpeg executable path."""
        paths_to_check = [
            "ffmpeg",
            "/usr/bin/ffmpeg",
            "/usr/local/bin/ffmpeg",
            "C:/ffmpeg/bin/ffmpeg.exe",
        ]
        
        for path in paths_to_check:
            try:
                result = subprocess.run(
                    [path, "-version"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    return path
            except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
                continue
        
        return None
    
    def get_video_info(self, video_path):
        """
        Get video information including dimensions, duration, and codec info.
        
        Args:
            video_path: Path to video file
            
        Returns:
            dict: Video metadata
        """
        info = {
            "width": 0,
            "height": 0,
            "duration": 0,
            "fps": 0,
            "has_audio": False,
            "audio_codec": None,
            "video_codec": None,
            "error": None
        }
        
        try:
            # Get stream info
            probe_cmd = [
                self.ffmpeg_path or "ffmpeg",
                "-v", "error",
                "-select_streams", "v:0",
                "-show_entries", "stream=width,height,r_frame_rate,codec_name",
                "-of", "json",
                str(video_path)
            ]
            result = subprocess.run(probe_cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                import json
                data = json.loads(result.stdout)
                if data.get("streams"):
                    stream = data["streams"][0]
                    info["width"] = int(stream.get("width", 0))
                    info["height"] = int(stream.get("height", 0))
                    info["video_codec"] = stream.get("codec_name")
                    
                    # Parse FPS
                    fps_str = stream.get("r_frame_rate", "0/1")
                    if "/" in fps_str:
                        num, den = map(int, fps_str.split("/"))
                        info["fps"] = num / den if den > 0 else 0
            
            # Get duration
            duration_cmd = [
                self.ffmpeg_path or "ffmpeg",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                str(video_path)
            ]
            duration_result = subprocess.run(duration_cmd, capture_output=True, text=True, timeout=30)
            if duration_result.returncode == 0:
                info["duration"] = float(duration_result.stdout.strip())
            
            # Check for audio
            audio_probe = [
                self.ffmpeg_path or "ffmpeg",
                "-v", "error",
                "-select_streams", "a:0",
                "-show_entries", "stream=codec_name",
                "-of", "csv=p=0",
                str(video_path)
            ]
            audio_result = subprocess.run(audio_probe, capture_output=True, text=True, timeout=30)
            info["has_audio"] = audio_result.returncode == 0 and bool(audio_result.stdout.strip())
            if info["has_audio"]:
                info["audio_codec"] = audio_result.stdout.strip()
                
        except Exception as e:
            info["error"] = str(e)
        
        return info
    
    def create_overlay_image(self, width, height, text="VidiSmart", logo_path=None):
        """
        Create an overlay image for video.
        
        Args:
            width: Overlay width
            height: Overlay height
            text: Text to display
            logo_path: Optional logo image path
            
        Returns:
            Path: Path to temporary overlay image
        """
        from PIL import Image, ImageDraw, ImageFont
        
        overlay = Image.new("RGBA", (width, height), (15, 23, 42, 230))
        draw = ImageDraw.Draw(overlay)
        
        # Try to load font
        font_size = int(height * 0.35)
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ]
        
        font = None
        for path in font_paths:
            try:
                font = ImageFont.truetype(path, font_size)
                break
            except (OSError, IOError):
                continue
        
        if font is None:
            font = ImageFont.load_default()
        
        # Calculate text position
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        # Draw text
        draw.text((x + 2, y + 2), text, font=font, fill=(0, 0, 0, 100))
        draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))
        
        # Save to temp file
        temp_path = Path(tempfile.gettempdir()) / f"brandswap_overlay_{Path(text).name}.png"
        overlay.save(temp_path)
        
        return temp_path
    
    def calculate_overlay_position(self, video_width, video_height, position="bottom-right"):
        """
        Calculate overlay position based on video dimensions.
        
        Args:
            video_width: Video width
            video_height: Video height
            position: Position string ("bottom-right", "bottom-left", "top-right", "top-left")
            
        Returns:
            tuple: (x, y) coordinates for overlay
        """
        # Default logo size estimate (18% of video width)
        logo_w = int(video_width * 0.18)
        logo_h = int(logo_w * 0.3)  # Approximate aspect ratio
        
        # Apply padding
        overlay_w = logo_w + self.padding_config["left"] + self.padding_config["right"]
        overlay_h = logo_h + self.padding_config["top"] + self.padding_config["bottom"]
        
        if position == "bottom-right":
            x = video_width - overlay_w
            y = video_height - overlay_h
        elif position == "bottom-left":
            x = self.padding_config["left"]
            y = video_height - overlay_h
        elif position == "top-right":
            x = video_width - overlay_w
            y = self.padding_config["top"]
        elif position == "top-left":
            x = self.padding_config["left"]
            y = self.padding_config["top"]
        else:
            # Default to bottom-right
            x = video_width - overlay_w
            y = video_height - overlay_h
        
        # Ensure within bounds
        x = max(0, min(x, video_width - overlay_w))
        y = max(0, min(y, video_height - overlay_h))
        
        return x, y, overlay_w, overlay_h
    
    def process_video(self, video_path, overlay_path, output_path, 
                      start_time=None, end_time=None, position="bottom-right"):
        """
        Process a video by adding an overlay.
        
        Args:
            video_path: Input video path
            overlay_path: Path to overlay image
            output_path: Output video path
            start_time: Overlay start time in seconds (None = always)
            end_time: Overlay end time in seconds (None = until end)
            position: Overlay position string
            
        Returns:
            dict: Result with status and metadata
        """
        if not self.ffmpeg_path:
            return {"status": "error", "message": "ffmpeg not found"}
        
        # Get video info
        video_info = self.get_video_info(video_path)
        if video_info["error"]:
            return {"status": "error", "message": f"Cannot read video: {video_info['error']}"}
        
        width = video_info["width"]
        height = video_info["height"]
        duration = video_info["duration"]
        
        # Calculate position
        paste_x, paste_y, overlay_w, overlay_h = self.calculate_overlay_position(
            width, height, position
        )
        
        # Determine enable expression
        if start_time is not None and end_time is not None:
            enable_expr = f"between(t,{start_time},{end_time})"
        elif start_time is not None:
            enable_expr = f"gte(t,{start_time})"
        elif end_time is not None:
            enable_expr = f"lte(t,{end_time})"
        else:
            enable_expr = "1"  # Always show
        
        # Create output directory
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Build ffmpeg command
        ffmpeg_cmd = [
            self.ffmpeg_path,
            "-y",
            "-i", str(video_path),
            "-i", str(overlay_path),
            "-filter_complex",
            f"[0:v][1:v]overlay={paste_x}:{paste_y}:enable='{enable_expr}'[outv]",
            "-map", "[outv]",
            "-map", "0:a?",  # Include audio if present
            "-c:v", "libx264",
            "-crf", "23",
            "-preset", "medium",
            "-movflags", "+faststart",
        ]
        
        # Preserve audio codec
        if video_info["has_audio"]:
            audio_codec = video_info["audio_codec"]
            if audio_codec in ["aac", "mp3", "opus", "vorbis"]:
                ffmpeg_cmd.extend(["-c:a", "copy"])
            else:
                ffmpeg_cmd.extend(["-c:a", "aac", "-b:a", "128k"])
        else:
            ffmpeg_cmd.extend(["-an"])  # No audio
        
        ffmpeg_cmd.append(str(output_path))
        
        try:
            result = subprocess.run(
                ffmpeg_cmd,
                capture_output=True,
                text=True,
                timeout=duration * 3 + 60  # Timeout based on video length
            )
            
            if result.returncode != 0:
                return {
                    "status": "error",
                    "message": f"ffmpeg error: {result.stderr[:500]}"
                }
            
            # Verify output
            output_info = self.get_video_info(output_path)
            if output_info["width"] != width or output_info["height"] != height:
                return {
                    "status": "warning",
                    "message": f"Dimension mismatch! Input: {width}x{height}, Output: {output_info['width']}x{output_info['height']}",
                    "input_size": (width, height),
                    "output_size": (output_info["width"], output_info["height"])
                }
            
            return {
                "status": "success",
                "message": f"Processed {video_path.name}",
                "size": (width, height),
                "duration": duration,
                "output_path": str(output_path)
            }
            
        except subprocess.TimeoutExpired:
            return {"status": "error", "message": "ffmpeg timeout"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def process_video_end_tag(self, video_path, overlay_path, output_path, tag_duration=5):
        """
        Process video with overlay only in the last N seconds (end-tag mode).
        
        Args:
            video_path: Input video path
            overlay_path: Path to overlay image
            output_path: Output video path
            tag_duration: Duration of end tag in seconds
            
        Returns:
            dict: Result with status and metadata
        """
        video_info = self.get_video_info(video_path)
        duration = video_info["duration"]
        
        if duration <= 0:
            return {"status": "error", "message": "Cannot determine video duration"}
        
        start_time = max(0, duration - tag_duration)
        
        return self.process_video(
            video_path,
            overlay_path,
            output_path,
            start_time=start_time,
            end_time=duration,
            position="bottom-right"
        )


def run_agent_tests():
    """Run self-tests for the Video Processing Agent."""
    print("Video Processing Agent Self-Tests")
    print("=" * 50)
    
    agent = VideoProcessingAgent()
    
    if agent.ffmpeg_path:
        print(f"ffmpeg found at: {agent.ffmpeg_path}")
    else:
        print("WARNING: ffmpeg not found!")
    
    # Test position calculation
    x, y, w, h = agent.calculate_overlay_position(1920, 1080, "bottom-right")
    print(f"Overlay position for 1920x1080: ({x}, {y}), size: ({w}x{h})")
    
    print("\nAgent initialized successfully!")
    return agent


if __name__ == "__main__":
    run_agent_tests()
