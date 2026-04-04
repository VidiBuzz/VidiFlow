#!/usr/bin/env python3
"""
Fix SVG colors by replacing black fill with transparent fill
"""

import os
import re
import glob

def fix_svg_file(svg_file):
    """Replace black fill with transparent fill in a single SVG file"""
    
    with open(svg_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace fill="#000000" with fill="none"
    new_content = re.sub(
        r'fill="#000000" stroke="none"',
        'fill="none" stroke="#000000"',
        content
    )
    
    with open(svg_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

def main():
    """Fix all SVG files in svg_output directory"""
    svg_files = glob.glob("svg_output/*.svg")
    
    for svg_file in svg_files:
        print(f"Fixing {svg_file}")
        fix_svg
