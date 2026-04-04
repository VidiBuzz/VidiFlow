#!/usr/bin/env python3
"""
Convert Vidi PNG logos to SVG format
This script helps convert PNG logo files to SVG format for better scalability
"""

import os
import sys
import subprocess
from pathlib import Path
import argparse

def check_dependencies():
    """Check if required tools are installed"""
    missing_tools = []
    
    # Check for potrace
    try:
        subprocess.run(['potrace', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        missing_tools.append('potrace')
    
    # Check for ImageMagick convert
    try:
        subprocess.run(['convert', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        missing_tools.append('ImageMagick (convert)')
    
    return missing_tools

def convert_png_to_svg(input_png, output_svg, threshold=0.5):
    """Convert PNG to SVG using potrace"""
    try:
        # Create temporary PBM file
        temp_pbm = "temp_logo.pbm"
        
        # Convert PNG to PBM using ImageMagick
        subprocess.run([
            'convert', input_png, '-threshold', f'{int(threshold*100)}%', temp_pbm
        ], check=True)
        
        # Convert PBM to SVG using potrace
        subprocess.run([
            'potrace', temp_pbm, 
            '--svg', 
            '--output', output_svg
        ], check=True)
        
        # Clean up temporary file
        if os.path.exists(temp_pbm):
            os.remove(temp_pbm)
        
        return True
        
    except Exception as e:
        print(f"Error converting {input_png} to SVG: {e}")
        # Clean up temporary file if it exists
        if 'temp_pbm' in locals() and os.path.exists(temp_pbm):
            os.remove(temp_pbm)
        return False

def find_vidi_png_files(directory, pattern="vidi*.png"):
    """Find PNG files matching the vidi pattern"""
    path = Path(directory)
    return list(path.glob(pattern))

def main():
    parser = argparse.ArgumentParser(description='Convert Vidi PNG logos to SVG format')
    parser.add_argument('input_dir', help='Directory containing PNG files')
    parser.add_argument('--output-dir', '-o', default='svg_output', 
                       help='Output directory for SVG files')
    parser.add_argument('--pattern', '-p', default='vidi*.png', 
                       help='File pattern to match')
    parser.add_argument('--threshold', '-t', type=float, default=0.5,
                       help='Threshold for binarization (0.0-1.0)')
    
    args = parser.parse_args()
    
    # Check dependencies
    missing_tools = check_dependencies()
    if missing_tools:
        print(f"Error: Missing required tools: {', '.join(missing_tools)}")
        print("Please install:")
        print("- potrace: sudo apt install potrace")
        print("- ImageMagick: sudo apt install imagemagick")
        sys.exit(1)
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Find PNG files
    png_files = find_vidi_png_files(args.input_dir, args.pattern)
    
    if not png_files:
        print(f"No PNG files found matching '{args.pattern}' in {args.input_dir}")
        sys.exit(1)
    
    print(f"Found {len(png_files)} PNG files to convert:")
    
    success_count = 0
    for png_file in png_files:
        svg_filename = png_file.stem + '.svg'
        output_svg = os.path.join(args.output_dir, svg_filename)
        
        print(f"Converting {png_file.name} -> {svg_filename}")
        
        if convert_png_to_svg(str(png_file), output_svg, args.threshold):
            success_count += 1
        else:
            print(f"Failed to convert {png_file.name}")
    
    print(f"\nConversion complete: {success_count}/{len(png_files)} files converted")
    print(f"SVG files saved to: {args.output_dir}")

if __name__ == "__main__":
    main()
