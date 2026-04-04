#!/usr/bin/env python3
"""
Copy images from Master PDF to V7 PDF using pypdf + fitz.
Strategy: For pages with images, make the page taller, insert image at top,
then merge V7 content below it.
"""

import fitz  # PyMuPDF for image extraction and page rendering
import pypdf
import io
import re
from difflib import SequenceMatcher

MASTER_PATH = "/mnt/m/+Proj/VidiSmart/The Speed of Visual Ai - Master Copy.pdf"
V7_PATH = "/mnt/m/+Proj/VidiSmart/Speed_of_Visual_AI_Complete V7.pdf"
OUTPUT_PATH = "/mnt/m/+Proj/VidiSmart/Speed_of_Visual_AI_Complete V7_With_Images.pdf"


def clean_text(text):
    text = re.sub(r"^\d+\s+", "", text.strip())
    text = re.sub(
        r"The Speed of Agentic Visual AI\s*·\s*VidiSmart / Savage Solutions\s*·\s*James May\s*\d+\s*",
        "",
        text,
    )
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()


def text_similarity(a, b):
    a_clean = clean_text(a)
    b_clean = clean_text(b)
    if not a_clean or not b_clean:
        return 0.0
    return SequenceMatcher(None, a_clean[:500], b_clean[:500]).ratio()


def find_best_match(v7_text, master_texts):
    best_idx = -1
    best_score = 0.0
    for idx, mt in enumerate(master_texts):
        score = text_similarity(v7_text, mt)
        if score > best_score:
            best_score = score
            best_idx = idx
    return best_idx, best_score


def copy_images_from_master_to_v7():
    print("Opening PDFs...")
    master_doc = fitz.open(MASTER_PATH)
    v7_doc = fitz.open(V7_PATH)

    print("Extracting master page texts...")
    master_texts = [master_doc[i].get_text() for i in range(len(master_doc))]

    page_w = v7_doc[0].rect.width
    page_h = v7_doc[0].rect.height

    output_doc = fitz.open()

    print(f"Processing {len(v7_doc)} V7 pages...")
    images_added = 0
    pages_matched = 0
    pages_with_images = 0

    for v7_page_num in range(len(v7_doc)):
        v7_page = v7_doc[v7_page_num]
        v7_text = v7_page.get_text()
        best_master_idx, best_score = find_best_match(v7_text, master_texts)

        has_top_images = False
        top_images = []
        max_img_bottom = 0

        if best_score > 0.15:
            pages_matched += 1
            master_page = master_doc[best_master_idx]

            # Extract images from master page
            master_images = master_page.get_images(full=True)
            for img_idx, img_info in enumerate(master_images):
                xref = img_info[0]
                try:
                    rects = master_page.get_image_rects(xref)
                    pix = fitz.Pixmap(master_doc, xref)
                    if pix.alpha:
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    if rects:
                        for rect in rects:
                            if rect.y0 < 200:  # Top images only
                                top_images.append((pix, rect))
                                has_top_images = True
                                if rect.y1 > max_img_bottom:
                                    max_img_bottom = rect.y1
                except Exception as e:
                    print(
                        f"    Warning: Could not extract image from master page {best_master_idx + 1}: {e}"
                    )

        if has_top_images:
            pages_with_images += 1
            extra_height = max_img_bottom + 15  # 15px gap
            new_page_h = page_h + extra_height
            new_page = output_doc.new_page(width=page_w, height=new_page_h)

            # Place images at top
            for pix, rect in top_images:
                new_page.insert_image(rect, pixmap=pix)
                images_added += 1
                pix = None

            # Render V7 page content below images
            target_rect = fitz.Rect(0, extra_height, page_w, new_page_h)
            new_page.show_pdf_page(target_rect, v7_doc, v7_page_num)

        else:
            # No top images — copy page as-is
            output_doc.insert_pdf(v7_doc, from_page=v7_page_num, to_page=v7_page_num)

        if (v7_page_num + 1) % 20 == 0:
            print(f"  Processed {v7_page_num + 1}/{len(v7_doc)} pages...")

    v7_page_count = len(v7_doc)
    print(f"\nSaving output to {OUTPUT_PATH}...")
    output_doc.save(OUTPUT_PATH)
    output_doc.close()
    v7_doc.close()
    master_doc.close()

    print(f"\n{'=' * 60}")
    print(f"SUMMARY")
    print(f"{'=' * 60}")
    print(f"V7 pages processed: {v7_page_count}")
    print(f"Pages matched: {pages_matched}")
    print(f"Pages with images added: {pages_with_images}")
    print(f"Images added: {images_added}")
    print(f"Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    copy_images_from_master_to_v7()
