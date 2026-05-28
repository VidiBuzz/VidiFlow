#!/usr/bin/env python3
"""
Create a realistic test image with a recognizable logo pattern for brand-swap testing.
This creates a mock "NotebookLM" style logo that we can replace with "VidiSmart".
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Create test directory if it doesn't exist
os.makedirs(os.path.dirname(__file__), exist_ok=True)

# Create a realistic test image (1200x800) - like a screenshot
img = Image.new('RGB', (1200, 800), color=(255, 255, 255))
draw = ImageDraw.Draw(img)

# Add a header bar
draw.rectangle([0, 0, 1200, 80], fill=(245, 245, 245))

# Create a mock "NotebookLM" style logo in the top-right
# This simulates a real brand logo that needs to be replaced
logo_x = 950
logo_y = 20
logo_width = 200
logo_height = 40

# Draw logo background
draw.rectangle([logo_x, logo_y, logo_x + logo_width, logo_y + logo_height], 
               fill=(66, 133, 244))  # Google blue

# Add "NotebookLM" text
try:
    font = ImageFont.truetype("arial.ttf", 24)
except:
    font = ImageFont.load_default()

draw.text((logo_x + 10, logo_y + 8), "NotebookLM", fill=(255, 255, 255), font=font)

# Add some content below to make it look like a real page
draw.rectangle([50, 120, 1150, 200], fill=(240, 240, 240))
draw.text((70, 140), "AI-Powered Research Assistant", fill=(51, 51, 51), font=font)

# Add some mock content blocks
for i in range(3):
    y_pos = 250 + (i * 150)
    draw.rectangle([50, y_pos, 1150, y_pos + 120], fill=(250, 250, 250))
    draw.text((70, y_pos + 20), f"Feature {i+1}: Advanced Analysis", fill=(51, 51, 51), font=font)

# Save the test image
img.save(os.path.join(os.path.dirname(__file__), 'realistic_test_input.png'))
print("[OK] Created realistic_test_input.png with NotebookLM-style logo")

# Now create the replacement logo (VidiSmart)
replacement_img = Image.new('RGB', (200, 40), color=(99, 102, 241))  # Indigo
replacement_draw = ImageDraw.Draw(replacement_img)

try:
    font = ImageFont.truetype("arial.ttf", 24)
except:
    font = ImageFont.load_default()

replacement_draw.text((10, 8), "VidiSmart", fill=(255, 255, 255), font=font)
replacement_img.save(os.path.join(os.path.dirname(__file__), 'realistic_replacement_logo.png'))
print("[OK] Created realistic_replacement_logo.png (VidiSmart)")

# Also create a template image (just the NotebookLM logo portion for detection)
template_img = Image.new('RGB', (200, 40), color=(255, 255, 255))
template_draw = ImageDraw.Draw(template_img)
template_draw.rectangle([0, 0, 200, 40], fill=(66, 133, 244))
template_draw.text((10, 8), "NotebookLM", fill=(255, 255, 255), font=font)
template_img.save(os.path.join(os.path.dirname(__file__), 'realistic_template.png'))
print("[OK] Created realistic_template.png (NotebookLM template for detection)")

print("\nNext steps:")
print("1. Upload realistic_template.png as the template")
print("2. Upload realistic_replacement_logo.png as the replacement")
print("3. Upload realistic_test_input.png to the input folder")
print("4. Check the output to verify logo replacement and alignment")
