"""
Tests for resume PDF text extraction.
"""
import io

import pytest
from fastapi import HTTPException, UploadFile
from pypdf import PdfWriter

from app.services import resume_service


def _make_pdf_bytes() -> bytes:
    """Builds a minimal valid (but textless) PDF for structural tests."""
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def _make_upload_file(filename: str, content_type: str) -> UploadFile:
    return UploadFile(filename=filename, file=io.BytesIO(b""), headers={"content-type": content_type})


class TestExtractResumeText:
    def test_rejects_non_pdf_content_type(self):
        raw = b"just some bytes"
        upload = _make_upload_file("resume.docx", "application/vnd.openxmlformats")

        with pytest.raises(HTTPException) as exc_info:
            resume_service.extract_resume_text(upload, raw)
        assert exc_info.value.status_code == 400

    def test_rejects_oversized_file(self):
        upload = _make_upload_file("resume.pdf", "application/pdf")
        oversized = b"0" * (6 * 1024 * 1024)  # 6MB > default 5MB limit

        with pytest.raises(HTTPException) as exc_info:
            resume_service.extract_resume_text(upload, oversized)
        assert exc_info.value.status_code == 400
        assert "too large" in exc_info.value.detail.lower()

    def test_blank_pdf_raises_422_no_extractable_text(self):
        upload = _make_upload_file("resume.pdf", "application/pdf")
        raw = _make_pdf_bytes()

        with pytest.raises(HTTPException) as exc_info:
            resume_service.extract_resume_text(upload, raw)
        assert exc_info.value.status_code == 422

    def test_corrupt_pdf_raises_400(self):
        upload = _make_upload_file("resume.pdf", "application/pdf")
        raw = b"%PDF-1.4 this is not actually a valid pdf structure"

        with pytest.raises(HTTPException) as exc_info:
            resume_service.extract_resume_text(upload, raw)
        assert exc_info.value.status_code == 400
