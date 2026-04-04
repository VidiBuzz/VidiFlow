#!/usr/bin/env python3
"""
Convert AI Consultants Report from Markdown to PDF
"""

from md2pdf.core import md2pdf
import os


def main():
    input_file = "ai-coach.report.md"
    output_file = "AI_Consultants_Report.pdf"

    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found")
        return

    print(f"Reading {input_file}...")
    with open(input_file, "r", encoding="utf-8") as f:
        markdown_content = f.read()

    print(f"Converting to PDF...")
    md2pdf(output_file, raw=markdown_content, css=None, base_url=".")

    if os.path.exists(output_file):
        file_size = os.path.getsize(output_file)
        print(f"Successfully created: {output_file} ({file_size:,} bytes)")
    else:
        print("Error: PDF creation failed")


if __name__ == "__main__":
    main()
