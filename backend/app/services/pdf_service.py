"""
PDF Service: Handles PDF validation, text extraction, and chunking.
Uses PyPDF for extraction and LangChain's RecursiveCharacterTextSplitter for chunking.
"""

import hashlib
import os
import re
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import aiofiles
from fastapi import HTTPException, UploadFile, status
try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from app.config import get_settings

settings = get_settings()


class PDFService:
    """Service for PDF processing: validation, extraction, and chunking."""

    ALLOWED_MIME_TYPES = {"application/pdf", "application/x-pdf"}
    ALLOWED_EXTENSIONS = {".pdf"}

    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""],
        )

    def validate_file(self, file: UploadFile) -> None:
        """
        Validate uploaded file for type and size constraints.
        Raises HTTPException on validation failure.
        """
        # Check extension
        filename = file.filename or ""
        ext = Path(filename).suffix.lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{ext}'. Only PDF files are accepted."
            )

        # Check content type if available
        if file.content_type and file.content_type not in self.ALLOWED_MIME_TYPES:
            # Some browsers send 'application/octet-stream' for PDFs, so we allow it
            if file.content_type not in {"application/octet-stream", "binary/octet-stream"}:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid content type '{file.content_type}'."
                )

    async def save_file(self, file: UploadFile) -> Tuple[str, str, int]:
        """
        Save uploaded file to disk with a secure, unique filename.
        Returns: (saved_path, secure_filename, file_size_bytes)
        """
        original_name = file.filename or "unknown.pdf"
        # Sanitize filename
        base_name = Path(original_name).stem
        base_name = re.sub(r"[^\w\s-]", "", base_name).strip()
        base_name = re.sub(r"[\s]+", "_", base_name)

        # Generate unique suffix from content hash
        content = await file.read()
        file_hash = hashlib.md5(content).hexdigest()[:8]
        secure_name = f"{base_name}_{file_hash}.pdf"
        save_path = os.path.join(settings.upload_directory, secure_name)

        # Check size
        if len(content) > settings.max_upload_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {settings.max_upload_size_mb}MB."
            )

        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        # Save to disk
        async with aiofiles.open(save_path, "wb") as f:
            await f.write(content)

        return save_path, secure_name, len(content)

    def extract_text_from_pdf(self, file_path: str) -> Tuple[List[Dict], int]:
        """
        Extract text page-by-page from a PDF.
        Returns: (page_data list, total_page_count)
        Each item in page_data: {"page_number": int, "text": str}
        """
        try:
            reader = PdfReader(file_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Could not read PDF file: {str(e)}"
            )

        total_pages = len(reader.pages)
        if total_pages == 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="The PDF file contains no pages."
            )

        page_data = []
        for page_num, page in enumerate(reader.pages, start=1):
            try:
                raw_text = page.extract_text() or ""
                cleaned = self._clean_text(raw_text)
                if cleaned:
                    page_data.append({
                        "page_number": page_num,
                        "text": cleaned
                    })
            except Exception:
                # Skip pages with extraction errors
                continue

        if not page_data:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract any text from the PDF. It may be scanned or image-based."
            )

        return page_data, total_pages

    def _clean_text(self, text: str) -> str:
        """Clean extracted text: remove extra whitespace, fix encoding issues."""
        # Remove null bytes and non-printable chars (except newlines/tabs)
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
        # Normalize whitespace
        text = re.sub(r"[ \t]+", " ", text)
        # Remove excessive blank lines (more than 2)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    def create_chunks(
        self,
        page_data: List[Dict],
        document_id: str,
        original_filename: str,
        secure_filename: str,
    ) -> List[Document]:
        """
        Split page texts into overlapping chunks and attach metadata.
        Returns list of LangChain Document objects ready for embedding.
        """
        all_chunks: List[Document] = []
        chunk_index = 0

        for page_info in page_data:
            page_num = page_info["page_number"]
            page_text = page_info["text"]

            # Split the page text into chunks
            page_chunks = self.text_splitter.split_text(page_text)

            for chunk_text in page_chunks:
                if not chunk_text.strip():
                    continue

                doc = Document(
                    page_content=chunk_text,
                    metadata={
                        "document_id": document_id,
                        "document_name": original_filename,
                        "secure_filename": secure_filename,
                        "page_number": page_num,
                        "chunk_index": chunk_index,
                        "chunk_length": len(chunk_text),
                    }
                )
                all_chunks.append(doc)
                chunk_index += 1

        return all_chunks

    def compute_file_hash(self, file_path: str) -> str:
        """Compute MD5 hash of a file for duplicate detection."""
        h = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()


# Singleton instance
pdf_service = PDFService()
