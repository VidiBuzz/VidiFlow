import sys
import subprocess

def get_pdf_reader():
    try:
        import pypdf
        return pypdf.PdfReader
    except ImportError:
        pass
    try:
        import PyPDF2
        return PyPDF2.PdfReader
    except ImportError:
        print("Installing pypdf...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
        import pypdf
        return pypdf.PdfReader

def extract_text(pdf_path, out_path):
    try:
        ReaderClass = get_pdf_reader()
        reader = ReaderClass(pdf_path)
        text = ""
        for page in reader.pages:
            extr = page.extract_text()
            if extr:
                text += extr + "\n"
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(text)
        print("Success! The text has been extracted to " + out_path)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python temp_extract.py input.pdf output.txt")
    else:
        extract_text(sys.argv[1], sys.argv[2])
