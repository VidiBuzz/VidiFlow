# Book Image Inserter

AI-powered tool for intelligently inserting images into Word documents at appropriate locations.

## Overview

The Book Image Inserter analyzes your Word document content, matches it with available images, and inserts images at contextually relevant positions. It uses:

- **Natural Language Processing** to understand document structure and content
- **Keyword matching** to find relevant images for each section
- **Context detection** to identify where images would be most impactful
- **Image categorization** to match visual content with textual content

## Features

- 📄 Analyzes Word document structure (headings, sections, paragraphs)
- 🖼️ Scans and categorizes images from a directory
- 🤖 AI-powered matching of images to content
- 📊 Generates detailed analysis reports
- ✏️ Inserts images with captions at optimal locations
- ⚙️ Configurable image sizing and placement

## Requirements

- Python 3.7+
- Required packages (auto-installed if missing):
  - `python-docx` - Word document processing
  - `Pillow` - Image processing
  - `scikit-learn` - Content analysis
  - `numpy` - Numerical operations

## Installation

The script will automatically install required dependencies on first run. Manual installation:

```bash
pip install python-docx Pillow scikit-learn numpy
```

## Usage

### Basic Usage

Process your document with default settings:

```bash
python book_image_inserter.py "M:\+Proj\VidiSmart\Speed_of_AI_2026_FINAL.docx"
```

Or use the batch file (Windows):

```bash
run_image_inserter.bat "M:\+Proj\VidiSmart\Speed_of_AI_2026_FINAL.docx"
```

### Generate Analysis Report Only

See where images would be placed without modifying the document:

```bash
python book_image_inserter.py "document.docx" --report-only
```

### Custom Options

```bash
python book_image_inserter.py "document.docx" ^
    --images-dir "C:\custom\images" ^
    --output "output_document.docx" ^
    --image-width 6.0
```

## Command-Line Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `document` | Path to Word document (required) | - |
| `--images-dir` | Directory containing images | `M:\code\vidismart\images` |
| `--output` | Output file path | `{input}_with_images.docx` |
| `--report-only` | Generate report without editing | `false` |
| `--image-width` | Image width in inches | `5.0` |
| `--start-chapter` | Start inserting from chapter N | (all chapters) |
| `--end-chapter` | Stop at chapter N (inclusive) | (all chapters) |

## How It Works

### 1. Image Scanning
The tool scans the images directory and:
- Extracts keywords from filenames
- Categorizes images (AI agents, business, technology, etc.)
- Records image dimensions and file sizes

### 2. Document Analysis
The tool analyzes your Word document:
- Identifies headings and sections
- Extracts keywords from content
- Determines context types (introduction, technical, example, etc.)
- Detects image cue phrases ("see figure", "shown below", etc.)

### 3. Image Matching
For each section, the tool:
- Scores images based on keyword matches
- Considers category relevance
- Evaluates image quality and dimensions
- Ranks images by contextual fit

### 4. Image Insertion
Images are inserted:
- Centered in the document
- With descriptive captions
- At optimal positions within sections
- Sized appropriately for readability

## Image Categories

The tool recognizes these image categories based on filenames:

| Category | Keywords |
|----------|----------|
| AI Agents | agent, orchestrate, crewai, autogen, langchain |
| AI Models | model, llm, gpt, claude, gemini, llama |
| Business | business, enterprise, company, corporate |
| Technology | tech, hardware, gpu, server, infrastructure |
| Workflow | workflow, pipeline, process, flow, diagram |
| UI Screens | ui, interface, screenshot, app, screen |
| Construction | construction, building, architect, contractor |
| Healthcare | health, medical, patient, clinical |
| Logistics | logistics, fleet, truck, shipping |
| Food | food, meal, grocery, kitchen, recipe |
| Finance | finance, trading, payment, invoice |

## Output Files

### Modified Document
- Original content preserved
- Images inserted at appropriate locations
- Each image includes a caption
- Saved to specified output path

### Analysis Report (`analysis_report.txt`)
Generated when using `--report-only` or always saved in output directory:

```
================================================================================
BOOK IMAGE INSERTION ANALYSIS REPORT
Generated: 2026-03-30 11:30:00
================================================================================

Document: M:\+Proj\VidiSmart\Speed_of_AI_2026_FINAL.docx
Images Available: 150
Document Sections: 24
Recommended Insertions: 35

--------------------------------------------------------------------------------
AVAILABLE IMAGES BY CATEGORY
--------------------------------------------------------------------------------
...

--------------------------------------------------------------------------------
DOCUMENT STRUCTURE
--------------------------------------------------------------------------------
...

--------------------------------------------------------------------------------
RECOMMENDED IMAGE PLACEMENTS
--------------------------------------------------------------------------------
...
```

### Log File (`image_inserter.log`)
Detailed processing log with timestamps and any errors encountered.

## Tips for Best Results

### Image Naming
Use descriptive filenames with keywords:
- ✅ `ai_agent_orchestration_workflow.png`
- ❌ `IMG_20260330_123456.jpg`

### Document Structure
- Use proper heading styles (Heading 1, Heading 2, etc.)
- Include cue phrases like "see figure below" or "as illustrated"
- Organize content into clear sections

### Image Quality
- Use images between 400-1200 pixels wide
- Avoid extremely small (< 200px) or large (> 2000px) images
- PNG format recommended for diagrams and screenshots

### Customization
Adjust image width based on your document:
- `--image-width 4.0` for narrower columns
- `--image-width 6.0` for full-width images

## Troubleshooting

### "Document not found"
Verify the path to your Word document is correct and accessible.

### "Images directory not found"
Check that the images folder exists. Default is `M:\code\vidismart\images`.

### No images inserted
- Run with `--report-only` to see the analysis
- Check `image_inserter.log` for errors
- Ensure images have descriptive filenames
- Verify document has proper heading structure

### Images too large/small
Adjust the `--image-width` parameter to control insertion size.

## Examples

### Example 1: Full Processing
```bash
python book_image_inserter.py "M:\+Proj\VidiSmart\Speed_of_AI_2026_FINAL.docx"
```
Output: `Speed_of_AI_2026_FINAL_with_images.docx`

### Example 2: Analysis Only
```bash
python book_image_inserter.py "document.docx" --report-only
```
Output: `analysis_report.txt`

### Example 3: Custom Output
```bash
python book_image_inserter.py "document.docx" ^
    --output "M:\+Proj\VidiSmart\Speed_of_AI_2026_FINAL_FINAL.docx" ^
    --image-width 5.5
```

## Architecture

```
BookImageInserter
├── scan_images()           # Scan and categorize images
├── analyze_document()      # Parse document structure
├── find_image_insertion_points()  # Match images to sections
├── insert_images()         # Insert images into document
└── generate_report()       # Create analysis report
```

## License

This tool is provided as-is for use with VidiSmart projects.

## Real-World Example: "The Speed of Visual AI" Book

### The Challenge
The book "The Speed of Visual AI" needed images throughout all 37 chapters, but Chapters 33-37 had no images due to weaker keyword matches in the AI algorithm.

### The Solution: Two-Step Process

#### Step 1: AI Content Matching (Chapters 1-32)
```bash
python book_image_inserter.py "The Speed of Visual Ai - FINAL.docx" \
  --images-dir "M:\code\vidismart\images" \
  --output "The Speed of Visual Ai - STEP1.docx" \
  --image-width 5.5
```
**Result**: 129 images inserted using AI content matching

#### Step 2: Forced Insertion (Chapters 33-37)
```bash
python insert_images_ch33.py
```
This custom script:
- Reads the STEP1 document
- Finds chapters 33-37 boundaries
- Inserts images evenly spaced (~1 per 15 paragraphs)
- Outputs final document

**Result**: 12 additional images in final chapters

### Final Output
**File**: `The Speed of Visual Ai - COMPLETE_WITH_IMAGES.docx`
**Total Images**: 241 images across all 37 chapters

**Chapter Distribution**:
- Chapters 1-10: 39 images
- Chapters 11-20: 34 images
- Chapters 21-30: 94 images
- Chapters 31-37: 74 images

### Alternative: Chapter-Specific Processing
You can also target specific chapters directly:

```bash
# Insert images only in chapters 33-37
python book_image_inserter.py "document.docx" \
  --start-chapter 33 \
  --end-chapter 37 \
  --output "chapters_33_37_images.docx"
```

**Note**: When using `--start-chapter` or `--end-chapter`, the matching threshold is lowered to 0.0 (from default 0.2) to ensure images are inserted even with weaker content matches.

## insert_images_ch33.py - Simple Chapter Insertion Tool

For cases where AI matching doesn't work well, use the simpler `insert_images_ch33.py`:

### Features
- Forces image insertion regardless of content matching
- Evenly spaces images throughout specified chapters
- No AI analysis required
- Faster processing

### Usage
1. Edit the script to set:
   - `doc_path` - Input document
   - `output_path` - Output document
   - `start_ch` and `end_ch` - Chapter range

2. Run:
```bash
python insert_images_ch33.py
```

### When to Use Which Tool

**Use book_image_inserter.py when:**
- You want AI-powered content matching
- Document has rich, descriptive content
- Images have descriptive filenames
- You want the best possible image-to-content fit

**Use insert_images_ch33.py when:**
- AI matching produces poor results
- You need guaranteed image placement
- Content is brief or technical
- You want evenly distributed images

## Support

For issues or questions, check the `image_inserter.log` file for detailed error information.

---

**Created**: 2026-04-01
**Last Updated**: 2026-04-01
**Version**: 2.0 (Added chapter-specific insertion)