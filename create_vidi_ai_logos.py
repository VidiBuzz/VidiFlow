#!/usr/bin/env python3
"""
Create Vidi Ai Logo Assets
Generates logo files for rebranding AnythingLLM to Vidi Ai
"""

import os
from PIL import Image, ImageDraw, ImageFont
import math

# Vidi Ai Brand Colors
PRIMARY_COLOR = (99, 102, 241)  # #6366f1 indigo
SECONDARY_COLOR = (139, 92, 246)  # #8b5cf6 purple
WHITE = (255, 255, 255)
DARK_BG = (17, 24, 39)  # Dark background for dark mode

def create_gradient(draw, width, height, color1, color2):
    """Create a gradient fill"""
    for y in range(height):
        ratio = y / height
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

def create_vidi_ai_logo(size, dark_mode=False):
    """Create Vidi Ai logo at specified size"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background with gradient
    if dark_mode:
        create_gradient(draw, size, size, (30, 27, 75), (49, 46, 129))
    else:
        create_gradient(draw, size, size, PRIMARY_COLOR, SECONDARY_COLOR)
    
    # Draw "V" and "Ai" text
    try:
        # Try to use a nice font, fall back to default
        font_size = int(size * 0.4)
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        # Calculate text position to center it
        text = "Vidi"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2 - int(size * 0.05)
        
        # Draw "Vidi" text
        draw.text((x, y), text, fill=WHITE, font=font)
        
        # Draw "Ai" below
        ai_text = "Ai"
        ai_bbox = draw.textbbox((0, 0), ai_text, font=font)
        ai_width = ai_bbox[2] - ai_bbox[0]
        ai_x = (size - ai_width) // 2
        ai_y = y + text_height + int(size * 0.02)
        draw.text((ai_x, ai_y), ai_text, fill=(255, 255, 255, 200), font=font)
        
    except Exception as e:
        print(f"Error drawing text: {e}")
        # Fallback: draw simple shapes
        draw.rectangle([size//4, size//4, 3*size//4, 3*size//4], fill=WHITE)
    
    return img

def create_favicon(size):
    """Create favicon at specified size"""
    return create_vidi_ai_logo(size, dark_mode=True)

def create_tray_icon(size, template=False):
    """Create system tray icon"""
    img = create_vidi_ai_logo(size, dark_mode=True)
    if template:
        # Convert to template image (macOS style)
        img = img.convert('L')
        # Invert for template
        img = Image.eval(img, lambda x: 255 - x)
    return img

def main():
    output_dir = r"C:\Temp\vidi-ai-logos"
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(os.path.join(output_dir, "assets"), exist_ok=True)
    
    print("Creating Vidi Ai logos...")
    
    # Main logos (dark and light)
    logo_sizes = [512, 256, 128, 64, 48, 32, 16]
    for size in logo_sizes:
        # Dark mode logo
        dark_logo = create_vidi_ai_logo(size, dark_mode=True)
        dark_logo.save(os.path.join(output_dir, f"vidi-ai-dark-{size}.png"))
        
        # Light mode logo
        light_logo = create_vidi_ai_logo(size, dark_mode=False)
        light_logo.save(os.path.join(output_dir, f"vidi-ai-light-{size}.png"))
        
        print(f"  Created logos at {size}x{size}")
    
    # Favicon (ICO format with multiple sizes)
    favicon_sizes = [16, 32, 48, 64]
    favicon_images = [create_favicon(s) for s in favicon_sizes]
    favicon_images[0].save(
        os.path.join(output_dir, "vidi-ai-favicon.ico"),
        format='ICO',
        sizes=[(s, s) for s in favicon_sizes],
        append_images=favicon_images[1:]
    )
    print("  Created favicon.ico")
    
    # Favicon PNG
    favicon_32 = create_favicon(32)
    favicon_32.save(os.path.join(output_dir, "vidi-ai-favicon.png"))
    print("  Created favicon.png")
    
    # Tray icons
    tray_sizes = [16, 32, 64, 128, 256, 512]
    for size in tray_sizes:
        # Regular tray icon
        tray = create_tray_icon(size)
        tray.save(os.path.join(output_dir, f"vidi-ai-tray-{size}.png"))
        
        # Template icons (for macOS)
        template = create_tray_icon(size, template=True)
        template.save(os.path.join(output_dir, f"vidi-ai-trayTemplate-{size}.png"))
        if size in [22, 44]:  # Standard macOS template sizes
            template.save(os.path.join(output_dir, f"vidi-ai-trayTemplate@2x-{size}.png"))
    
    print("  Created tray icons")
    
    # Asset versions (for web/frontend)
    asset_sizes = {
        'icon': [64, 128, 256],
        'logo': [200, 400, 600],
        'login-logo': [300, 450, 600]
    }
    
    for asset_type, sizes in asset_sizes.items():
        for size in sizes:
            if asset_type == 'icon':
                img = create_vidi_ai_logo(size, dark_mode=True)
            else:
                img = create_vidi_ai_logo(size, dark_mode=False)
            img.save(os.path.join(output_dir, "assets", f"vidi-ai-{asset_type}-{size}.png"))
    
    print("  Created asset versions")
    
    # Create SVG logo (scalable)
    svg_content = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vidiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="60" rx="8" fill="url(#vidiGradient)"/>
  <text x="100" y="38" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">Vidi Ai</text>
</svg>'''
    
    with open(os.path.join(output_dir, "assets", "vidi-ai-header.svg"), 'w') as f:
        f.write(svg_content)
    print("  Created SVG header logo")
    
    print(f"\nAll logos created in: {output_dir}")
    print("\nReady to replace AnythingLLM logos with Vidi Ai branding!")

if __name__ == "__main__":
    main()