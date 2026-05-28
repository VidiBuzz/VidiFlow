import os
import sys

input_file = "The_Speed_of_Agentic_Visual_AI.md"
output_file = r"C:\Users\James\My Drive\The_Speed_of_Agentic_Visual_AI.pdf"

try:
    from fpdf import FPDF
    print("Trying FPDF...")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=11)
    
    with open(input_file, "r", encoding="utf-8") as f:
        for line in f:
            # fpdf handles basic text but we need to encode to latin-1
            pdf.multi_cell(0, 6, txt=line.encode('latin-1', 'replace').decode('latin-1'))
    
    pdf.output(output_file)
    print("Successfully created PDF with FPDF!")
    sys.exit(0)
except ImportError:
    print("FPDF not found. Trying another method...")

import fitz # PyMuPDF
print("Trying PyMuPDF page-by-page...")
doc = fitz.open()

with open(input_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

page = doc.new_page()
p = fitz.Point(36, 36)
line_height = 14

for line in lines:
    line = line.strip('\n')
    # simple text wrapping
    words = line.split(' ')
    current_line = ""
    for word in words:
        if len(current_line) + len(word) < 90:
            current_line += word + " "
        else:
            page.insert_text(p, current_line, fontsize=11)
            p.y += line_height
            current_line = word + " "
            if p.y > page.rect.height - 36:
                page = doc.new_page()
                p = fitz.Point(36, 36)
    
    if current_line:
        page.insert_text(p, current_line, fontsize=11)
        p.y += line_height
        if p.y > page.rect.height - 36:
            page = doc.new_page()
            p = fitz.Point(36, 36)
            
    p.y += line_height / 2 # paragraph spacing

doc.save(output_file)
print("Successfully created PDF with PyMuPDF!")
