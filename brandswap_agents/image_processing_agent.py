#!/usr/bin/env python3
"""
BrandSwap - Image Processing Agent
Handles overlay creation and image manipulation with proper dimension preservation.
"""

from PIL import Image, ImageDraw, ImageFont
import numpy as np
from pathlib import Path
import os


class ImageProcessingAgent:
    """Agent responsible for creating overlays and processing images."""
    
    def __init__(self, logo_path=None, default_text="VidiSmart", padding_config=None):
        """
        Initialize the Image Processing Agent.
        
        Args:
            logo_path: Path to custom logo image (optional)
            default_text: Default overlay text if no logo
            padding_config: Dict with left, right, top, bottom padding values
        """
        self.logo_path = Path(logo_path) if logo_path else None
        self.default_text = default_text
        self.padding_config = padding_config or {
            "left": 10,
            "right": 20,
            "top": 8,
            "bottom": 8
        }
    
    def create_overlay(self, width, height, text=None, logo=None):
        """
        Create a branded overlay of specified dimensions.
        
        Args:
            width: Overlay width in pixels
            height: Overlay height in pixels
            text: Text to display (uses default_text if None)
            logo: PIL Image to use as logo (overrides text if provided)
            
        Returns:
            PIL Image: RGBA overlay image
        """
        # Ensure minimum dimensions
        width = max(width, 50)
        height = max(height, 30)
        
        if logo is not None and isinstance(logo, Image.Image):
            return self._create_logo_overlay(logo, width, height)
        
        return self._create_text_overlay(text or self.default_text, width, height)
    
    def _create_text_overlay(self, text, width, height):
        """Create a text-based overlay."""
        # Create transparent background
        overlay = Image.new("RGBA", (width, height), (15, 23, 42, 230))
        draw = ImageDraw.Draw(overlay)
        
        # Try to load a good font
        font_size = int(height * 0.35)
        font = self._get_font(font_size)
        
        # Calculate text position
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        # Draw text with subtle shadow
        shadow_offset = 2
        draw.text(
            (x + shadow_offset, y + shadow_offset),
            text,
            font=font,
            fill=(0, 0, 0, 100)  # Shadow
        )
        draw.text(
            (x, y),
            text,
            font=font,
            fill=(255, 255, 255, 255)  # Main text
        )
        
        return overlay
    
    def _create_logo_overlay(self, logo_img, width, height):
        """Create an overlay with a logo image."""
        # Create transparent background
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        
        # Scale logo to fit while maintaining aspect ratio
        logo_aspect = logo_img.width / logo_img.height
        target_aspect = width / height
        
        if logo_aspect > target_aspect:
            # Logo is wider than target
            new_h = height - 10
            new_w = int(new_h * logo_aspect)
        else:
            # Logo is taller than target
            new_w = width - 20
            new_h = int(new_w / logo_aspect)
        
        # Ensure minimum size
        new_w = max(new_w, 20)
        new_h = max(new_h, 20)
        
        # Resize logo
        try:
            scaled_logo = logo_img.resize((new_w, new_h), Image.LANCZOS)
        except Exception:
            scaled_logo = logo_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Center the logo
        paste_x = (width - new_w) // 2
        paste_y = (height - new_h) // 2
        
        # Paste with logo as mask (for transparency)
        if scaled_logo.mode == "RGBA":
            overlay.paste(scaled_logo, (paste_x, paste_y), scaled_logo)
        else:
            overlay.paste(scaled_logo, (paste_x, paste_y), scaled_logo)
        
        return overlay
    
    def _get_font(self, size):
        """Get a TrueType font, falling back to default if not available."""
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/calibri.ttf",
        ]
        
        for path in font_paths:
            try:
                return ImageFont.truetype(path, size)
            except (OSError, IOError):
                continue
        
        # Fallback to default font
        return ImageFont.load_default()
    
    def calculate_overlay_bounds(self, logo_bounds, image_width, image_height):
        """
        Calculate overlay bounds with padding, ensuring they stay within image.
        
        Args:
            logo_bounds: Tuple (x1, y1, x2, y2) of detected logo
            image_width: Width of the source image
            image_height: Height of the source image
            
        Returns:
            tuple: (paste_x, paste_y, overlay_width, overlay_height)
        """
        x1, y1, x2, y2 = logo_bounds
        
        logo_w = x2 - x1
        logo_h = y2 - y1
        
        # Apply padding
        overlay_w = logo_w + self.padding_config["left"] + self.padding_config["right"]
        overlay_h = logo_h + self.padding_config["top"] + self.padding_config["bottom"]
        
        # Calculate paste position with padding
        paste_x = max(0, x1 - self.padding_config["left"])
        paste_y = max(0, y1 - self.padding_config["top"])
        
        # Ensure overlay doesn't exceed image bounds
        overlay_w = min(overlay_w, image_width - paste_x)
        overlay_h = min(overlay_h, image_height - paste_y)
        
        # Extend to right edge if logo is near edge (>90% of image width)
        if x2 > image_width * 0.9:
            overlay_w = image_width - paste_x
        
        return paste_x, paste_y, overlay_w, overlay_h
    
    def process_image(self, image_path, overlay, paste_x, paste_y, output_path=None):
        """
        Process an image by pasting an overlay at specified position.
        
        Args:
            image_path: Path to source image
            overlay: PIL Image overlay to paste
            paste_x: X coordinate for overlay
            paste_y: Y coordinate for overlay
            output_path: Path for output (if None, saves to default location)
            
        Returns:
            dict: Result with status and metadata
        """
        try:
            # Open original image
            original_img = Image.open(image_path)
            original_size = original_img.size
            original_mode = original_img.mode
            
            # Convert to RGBA for processing
            if original_img.mode != "RGBA":
                img = original_img.convert("RGBA")
            else:
                img = original_img.copy()
            
            # Paste overlay
            img.paste(overlay, (paste_x, paste_y), overlay)
            
            # Determine output path
            if output_path is None:
                output_path = Path(str(image_path).replace("images/", "images/rebranded/"))
            else:
                output_path = Path(output_path)
            
            # Create output directory
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Save with appropriate format
            if image_path.suffix.lower() in [".jpg", ".jpeg"]:
                img.convert("RGB").save(output_path, quality=95)
            elif image_path.suffix.lower() == ".png":
                img.save(output_path, optimize=True)
            else:
                img.save(output_path)
            
            # Verify dimensions match
            output_img = Image.open(output_path)
            if output_img.size != original_size:
                return {
                    "status": "error",
                    "message": f"Dimension mismatch! Input: {original_size}, Output: {output_img.size}",
                    "input_size": original_size,
                    "output_size": output_img.size
                }
            
            return {
                "status": "success",
                "message": f"Processed {image_path.name}",
                "size": original_size,
                "output_path": str(output_path)
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "input_path": str(image_path)
            }
    
    def get_padding_config(self):
        """Return current padding configuration."""
        return self.padding_config.copy()
    
    def set_padding_config(self, padding_config):
        """Update padding configuration."""
        self.padding_config = {
            "left": padding_config.get("left", 10),
            "right": padding_config.get("right", 20),
            "top": padding_config.get("top", 8),
            "bottom": padding_config.get("bottom", 8)
        }


def run_agent_tests():
    """Run self-tests for the Image Processing Agent."""
    print("Image Processing Agent Self-Tests")
    print("=" * 50)
    
    agent = ImageProcessingAgent(default_text="VidiSmart")
    
    # Test overlay creation
    overlay = agent.create_overlay(200, 60, text="Test")
    print(f"Overlay created: {overlay.size}")
    
    # Test bounds calculation
    logo_bounds = (500, 400, 600, 430)  # Example logo position
    paste_x, paste_y, w, h = agent.calculate_overlay_bounds(logo_bounds, 1920, 1080)
    print(f"Overlay bounds: pos=({paste_x}, {paste_y}), size=({w}x{h})")
    
    print("\nAgent initialized successfully!")
    return agent


if __name__ == "__main__":
    run_agent_tests()
