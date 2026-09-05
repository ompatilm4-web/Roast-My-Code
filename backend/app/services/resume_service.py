"""
Extracts plain text from an uploaded resume PDF.
"""
import io

from fastapi import HTTPException, UploadFile
from pypdf import PdfReader

from app.config import get_settings

settings = get_settings()


def extract_resume_text(file: UploadFile, raw_bytes: bytes) -> str:
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported")

    size_mb = len(raw_bytes) / (1024 * 1024)
    if size_mb > settings.MAX_RESUME_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({size_mb:.1f}MB). Max is {settings.MAX_RESUME_SIZE_MB}MB",
        )

    try:
        reader = PdfReader(io.BytesIO(raw_bytes))
        pages_text = [page.extract_text() or "" for page in reader.pages]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse PDF: {e}")

    text = "\n".join(pages_text).strip()
    if not text:
        raise HTTPException(
            status_code=422,
            detail="No extractable text found — this may be a scanned/image-only PDF",
        )

    return text[:6000]  # cap to keep prompt small and cheap
