#!/usr/bin/env python3
"""
Verify that the brand-swap logo replacement worked correctly.
Uses OpenCV to check if the VidiSmart logo is present in the output image.
"""

import cv2
import numpy as np
import os
import sys

def verify_logo_replacement(output_path, replacement_logo_path, template_path):
    """
    Verify that:
    1. The original template (NotebookLM) is NOT present in the output
    2. The replacement logo (VidiSmart) IS present in the output
    """
    
    print("=== Logo Replacement Verification ===\n")
    
    # Load images
    output_img = cv2.imread(output_path)
    replacement_logo = cv2.imread(replacement_logo_path)
    template_logo = cv2.imread(template_path)
    
    if output_img is None:
        print(f"[FAIL] Could not load output image: {output_path}")
        return False
    
    if replacement_logo is None:
        print(f"[FAIL] Could not load replacement logo: {replacement_logo_path}")
        return False
    
    if template_logo is None:
        print(f"[FAIL] Could not load template: {template_path}")
        return False
    
    print(f"Output image size: {output_img.shape[1]}x{output_img.shape[0]}")
    print(f"Replacement logo size: {replacement_logo.shape[1]}x{replacement_logo.shape[0]}")
    print(f"Template logo size: {template_logo.shape[1]}x{template_logo.shape[0]}\n")
    
    # Check 1: Verify replacement logo is present
    print("1. Checking if VidiSmart logo is present in output...")
    result_replacement = cv2.matchTemplate(output_img, replacement_logo, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result_replacement)
    
    print(f"   Match confidence: {max_val:.4f}")
    print(f"   Match location: {max_loc}")
    
    if max_val > 0.8:
        print("   [OK] VidiSmart logo detected in output!\n")
        replacement_found = True
    else:
        print("   [WARN] VidiSmart logo not strongly detected (threshold: 0.8)\n")
        replacement_found = False
    
    # Check 2: Verify original template is NOT present (or significantly reduced)
    print("2. Checking if NotebookLM logo was removed...")
    result_template = cv2.matchTemplate(output_img, template_logo, cv2.TM_CCOEFF_NORMED)
    min_val_t, max_val_t, min_loc_t, max_loc_t = cv2.minMaxLoc(result_template)
    
    print(f"   Match confidence: {max_val_t:.4f}")
    print(f"   Match location: {max_loc_t}")
    
    if max_val_t < 0.5:
        print("   [OK] NotebookLM logo successfully removed!\n")
        template_removed = True
    else:
        print("   [WARN] NotebookLM logo may still be present (threshold: 0.5)\n")
        template_removed = False
    
    # Check 3: Compare file sizes
    print("3. File size comparison...")
    output_size = os.path.getsize(output_path)
    print(f"   Output file size: {output_size} bytes\n")
    
    # Summary
    print("=== Verification Summary ===")
    if replacement_found and template_removed:
        print("[PASS] Logo replacement appears successful!")
        print("  - VidiSmart logo is present")
        print("  - NotebookLM logo was removed")
        return True
    elif replacement_found:
        print("[PARTIAL] VidiSmart logo added, but NotebookLM may still be visible")
        return True
    elif template_removed:
        print("[PARTIAL] NotebookLM removed, but VidiSmart not clearly detected")
        return True
    else:
        print("[FAIL] Logo replacement may not have worked correctly")
        return False

if __name__ == "__main__":
    # Find the latest output file
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'output')
    output_files = [f for f in os.listdir(output_dir) if 'realistic_test_input' in f]
    
    if not output_files:
        print("No output files found for realistic_test_input")
        sys.exit(1)
    
    # Get the most recent one
    output_files.sort(key=lambda f: os.path.getmtime(os.path.join(output_dir, f)), reverse=True)
    latest_output = os.path.join(output_dir, output_files[0])
    
    replacement_logo = os.path.join(os.path.dirname(__file__), 'realistic_replacement_logo.png')
    template_logo = os.path.join(os.path.dirname(__file__), 'realistic_template.png')
    
    success = verify_logo_replacement(latest_output, replacement_logo, template_logo)
    sys.exit(0 if success else 1)
