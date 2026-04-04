#!/usr/bin/env python3
"""
V8: V7 text + Master images, no duplicate images on consecutive pages.
"""

import fitz
import re
from difflib import SequenceMatcher

MASTER_PATH = "/mnt/m/+Proj/VidiSmart/The Speed of Visual Ai - Master Copy.pdf"
V7_PATH = "/mnt/m/+Proj/VidiSmart/Speed_of_Visual_AI_Complete V7.pdf"
OUTPUT_PATH = "/mnt/m/+Proj/VidiSmart/Speed_of_Visual_AI_Complete V8.pdf"


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


def get_top_images(master_doc, page_idx):
    page = master_doc[page_idx]
    images = page.get_images(full=True)
    results = []
    for img_info in images:
        xref = img_info[0]
        try:
            rects = page.get_image_rects(xref)
            pix = fitz.Pixmap(master_doc, xref)
            if pix.alpha:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            if rects:
                for rect in rects:
                    if rect.y0 < 200:
                        results.append((pix, rect))
        except Exception:
            pass
    return results


def create_v8():
    print("=== CREATING V8 ===")
    master_doc = fitz.open(MASTER_PATH)
    v7_doc = fitz.open(V7_PATH)

    master_texts = [master_doc[i].get_text() for i in range(len(master_doc))]
    page_w = v7_doc[0].rect.width
    page_h = v7_doc[0].rect.height

    output_doc = fitz.open()

    print(f"Processing {len(v7_doc)} pages...")
    total_images = 0
    pages_with_images = 0
    last_master_with_image = -1  # Track last master page that had an image placed

    for v7_idx in range(len(v7_doc)):
        v7_text = v7_doc[v7_idx].get_text()
        best_master_idx, score = find_best_match(v7_text, master_texts)

        top_images = []
        if score > 0.15 and best_master_idx >= 0:
            top_images = get_top_images(master_doc, best_master_idx)

        # Skip if same master page already had an image placed (avoid duplicates)
        if top_images and best_master_idx == last_master_with_image:
            top_images = []

        if top_images:
            pages_with_images += 1
            last_master_with_image = best_master_idx
            max_bottom = max(r.y1 for _, r in top_images)
            gap = 15
            image_area_height = max_bottom + gap
            new_page_h = page_h + image_area_height

            new_page = output_doc.new_page(width=page_w, height=new_page_h)

            for pix, rect in top_images:
                new_page.insert_image(rect, pixmap=pix)
                total_images += 1
                pix = None

            target_rect = fitz.Rect(0, image_area_height, page_w, new_page_h)
            new_page.show_pdf_page(target_rect, v7_doc, v7_idx)
        else:
            output_doc.insert_pdf(v7_doc, from_page=v7_idx, to_page=v7_idx)

        if (v7_idx + 1) % 30 == 0:
            print(f"  Processed {v7_idx + 1}/{len(v7_doc)}...")

    v7_count = len(v7_doc)
    output_doc.save(OUTPUT_PATH, garbage=4, deflate=True)
    output_doc.close()
    v7_doc.close()
    master_doc.close()

    print(
        f"\nV8 saved. Pages: {v7_count}, Images: {total_images}, With images: {pages_with_images}"
    )

    # === VERIFY ===
    print(f"\n=== VERIFYING V8 ===")
    verify_doc = fitz.open(OUTPUT_PATH)
    v7_orig = fitz.open(V7_PATH)

    overlaps = 0
    text_truncated = 0
    prev_image_xrefs = set()
    consecutive_duplicates = 0

    for i in range(len(verify_doc)):
        page = verify_doc[i]
        images = page.get_images(full=True)

        if images:
            current_xrefs = set(img[0] for img in images)
            if current_xrefs == prev_image_xrefs and len(current_xrefs) > 0:
                consecutive_duplicates += 1
                print(f"  DUPLICATE: Page {i + 1} has same image as page {i}")
            prev_image_xrefs = current_xrefs

            blocks = page.get_text("dict")["blocks"]
            text_blocks = [b for b in blocks if b.get("type") == 0]

            if text_blocks:
                min_text_y = min(b["bbox"][1] for b in text_blocks)
                for img_info in images:
                    xref = img_info[0]
                    try:
                        rects = page.get_image_rects(xref)
                        if rects:
                            for r in rects:
                                if r.y1 > min_text_y:
                                    overlaps += 1
                                    print(
                                        f"  OVERLAP page {i + 1}: img bottom {r.y1:.0f} > text start {min_text_y:.0f}"
                                    )
                    except:
                        pass

                out_text = page.get_text().strip()
                v7_text = v7_orig[i].get_text().strip()
                if len(out_text) < len(v7_text) * 0.5:
                    text_truncated += 1
                    print(
                        f"  TRUNCATED page {i + 1}: {len(out_text)} vs {len(v7_text)} chars"
                    )
        else:
            prev_image_xrefs = set()

        if (i + 1) % 40 == 0:
            print(f"  Verified {i + 1}/{len(verify_doc)}...")

    verify_doc.close()
    v7_orig.close()

    print(f"\n{'=' * 60}")
    print(f"VERIFICATION RESULTS")
    print(f"{'=' * 60}")
    print(f"Overlaps: {overlaps}")
    print(f"Consecutive duplicate images: {consecutive_duplicates}")
    print(f"Truncated text: {text_truncated}")

    if overlaps == 0 and consecutive_duplicates == 0 and text_truncated == 0:
        print(f"\nALL CHECKS PASSED - V8 is clean")
    else:
        print(f"\nISSUES FOUND")

    print(f"\nOutput: {OUTPUT_PATH}")


if __name__ == "__main__":
    create_v8()
