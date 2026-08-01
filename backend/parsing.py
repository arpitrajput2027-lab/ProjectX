import fitz  # PyMuPDF
import io

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extracts all text from a PDF file provided as bytes."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""
