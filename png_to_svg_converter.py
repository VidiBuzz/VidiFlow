#!/usr/bin/env python3
"""
PNG to SVG Converter
Converts PNG logo images to SVG format using multiple approaches
"""

import os
import sys
import subprocess
from pathlib import Path
import argparse

def check_dependencies():
    """Check if required tools are installed"""
    required_tools = ['potrace', 'convert']
    missing_tools = []
    
    for tool in required_tools:
        try:
            subprocess.run([tool, '--version'], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            missing_tools.append(tool)
    
    return missing_tools

def png_to_svg_potrace(input_png, output_svg, threshold=0.5):
    """Convert PNG to SVG using potrace (best for logos and simple graphics)"""
    try:
        # First convert PNG to PBM (potrace input format)
        temp_pbm = "temp.pbm"
        
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

def main():
    parser = argparse.ArgumentParser(description='Convert PNG logos to SVG format')
    parser.add_argument('input_dir', help='Directory containing PNG files to convert')
    parser.add_argument('--output-dir', '-o', default='svg_output', 
                       help='Output directory for SVG files (default: svg_output)')
    parser.add_argument('--pattern', '-p', default='vidi*.png', 
                       help='File pattern to match (default: vidi*.png)')
    parser.add_argument('--threshold', '-t', type=float, default=0.5,
                       help='Threshold for binarization (0.0-1.0, default: 0.5)')
    
    args = parser.parse_args()
    
    # Check dependencies
    missing_tools = check_dependencies()
    if missing_tools:
        print(f"Error: Missing required tools: {', '.join(missing_tools)}")
        print("Please install:")
        print("- potrace: for vector conversion")
        print("- ImageMagick: for image conversion")
        sys.exit(1)
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Find PNG files matching pattern
    input_path = Path(args.input_dir)
    png_files = list(input_path.glob(args.pattern))
    
    if not png_files:
        print(f"No PNG files found matching pattern '{args.pattern}' in {args.input_dir}")
        sys.exit(1)
    
    print(f"Found {len(png_files)} PNG files to convert:")
    
    success_count = 0
    for png_file in png_files:
        svg_filename = png_file.stem + '.svg'
        output_svg = os.path.join(args.output_dir, svg_filename)
        
        print(f"Converting {png_file.name} -> {svg_filename}")
        
        if png_to_svg_potrace(str(png_file), output_svg, args.threshold):
            success_count += 1
        else:
            print(f"Failed to convert {png_file.name}")
    
    print(f"\nConversion complete: {success_count}/{len(png_files)} files converted successfully")
    print(f"SVG files saved to: {args.output_dir}")

if __name__ == "__main__":
    main()


