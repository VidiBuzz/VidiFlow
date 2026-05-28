#!/usr/bin/env python3
"""
Generate test images for BrandSwap pipeline testing.

Creates:
1. background.png - 800x600 image with a small colored rectangle (simulating a logo)
2. logo.png - 100x40 image (the logo extracted separately)
"""

import os
import cv2
import numpy as np

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# --- Create the background image (800x600) ---
# Blue gradient background
bg = np.zeros((600, 800, 3), dtype=np.uint8)
for y in range(600):
    bg[y, :] = [180 + int(75 * y / 600), 100, 50]  # BGR gradient

# Add a dark green rectangle in the top-right corner (simulating a logo/watermark)
# Position: top-right, 100x40 pixels
logo_x1, logo_y1 = 680, 20
logo_x2, logo_y2 = 780, 60
cv2.rectangle(bg, (logo_x1, logo_y1), (logo_x2, logo_y2), (0, 120, 0), -1)  # Green filled rect
# Add some white text on the rectangle
cv2.putText(bg, "OLD", (logo_x1 + 25, logo_y1 + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

# Add some random content to make it more realistic
cv2.putText(bg, "Sample Website Screenshot", (50, 300), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (60, 60, 60), 2)
cv2.putText(bg, "This is a test background image", (50, 340), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (80, 80, 80), 1)

# Draw some decorative elements
cv2.line(bg, (50, 80), (750, 80), (200, 200, 200), 2)
cv2.line(bg, (50, 400), (750, 400), (200, 200, 200), 1)

bg_path = os.path.join(OUTPUT_DIR, 'background.png')
cv2.imwrite(bg_path, bg)
print(f"Created background.png: {bg.shape[1]}x{bg.shape[0]} ({os.path.getsize(bg_path)} bytes)")

# --- Create the logo image (100x40) ---
# Same green rectangle with text - this is what the template matcher should find
logo = np.zeros((40, 100, 3), dtype=np.uint8)
logo[:, :] = (0, 120, 0)  # Same green as background
cv2.putText(logo, "OLD", (25, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

logo_path = os.path.join(OUTPUT_DIR, 'logo.png')
cv2.imwrite(logo_path, logo)
print(f"Created logo.png: {logo.shape[1]}x{logo.shape[0]} ({os.path.getsize(logo_path)} bytes)")

print("\nTest images created successfully!")
print(f"Background: {bg_path}")
print(f"Logo template: {logo_path}")
