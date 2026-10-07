"""
Documents API: Upload, list, and delete document endpoints.
"""

import logging
import os
import time
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from app.models.schemas import (
    DeleteDocumentResponse,
    DocumentCreate,
    DocumentListResponse,
    ErrorResponse,
    StatsResponse,
    UploadResponse,
)
from app.services.chat_history_service import chat_history_service
from app.services.document_store import document_store
from app.services.pdf_service import pdf_service
from app.services.vector_service import vector_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and process a PDF document",
)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF file and process it through the RAG pipeline:
    1. Validate file type and size
    2. Extract text from PDF
    3. Split into chunks
    4. Generate embeddings
    5. Store in ChromaDB
    6. Save metadata
    """
    start_time = time.time()
    temp_path = None

    try:
        # ── Validate file ──────────────────────────────────────────────────
        pdf_service.validate_file(file)

        # ── Check for duplicate by original filename ───────────────────────
        existing_id = document_store.document_exists_by_filename(file.filename)
        if existing_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A document named '{file.filename}' has already been uploaded. "
                       f"Delete the existing document first to re-upload."
            )

        # ── Save file to disk ──────────────────────────────────────────────
        temp_path, secure_name, file_size = await pdf_service.save_file(file)

        # ── Extract text ───────────────────────────────────────────────────
        page_data, total_pages = pdf_service.extract_text_from_pdf(temp_path)

        # ── Create document ID ─────────────────────────────────────────────
        document_id = str(uuid.uuid4())

        # ── Create chunks ──────────────────────────────────────────────────
        chunks = pdf_service.create_chunks(
            page_data=page_data,
            document_id=document_id,
            original_filename=file.filename,
            secure_filename=secure_name,
        )

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No text content could be extracted from this PDF."
            )

        # ── Store in ChromaDB ──────────────────────────────────────────────
        chunks_stored = vector_service.add_documents(chunks, document_id)

        # ── Save document metadata ─────────────────────────────────────────
        doc_create = DocumentCreate(
            document_id=document_id,
            filename=secure_name,
            original_filename=file.filename,
            file_size=file_size,
            num_pages=total_pages,
            num_chunks=chunks_stored,
            upload_date=datetime.utcnow(),
            status="processed",
        )
        document_store.add_document(doc_create)

        processing_time = time.time() - start_time
        logger.info(
            f"Document processed: {file.filename} | "
            f"pages={total_pages} | chunks={chunks_stored} | "
            f"time={processing_time:.2f}s"
        )

        return UploadResponse(
            message="Document uploaded and processed successfully.",
            document_id=document_id,
            filename=file.filename,
            num_pages=total_pages,
            num_chunks=chunks_stored,
            processing_time_seconds=round(processing_time, 2),
        )

    except HTTPException:
        # Clean up temp file on validation errors
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        raise
    except Exception as e:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        logger.error(f"Unexpected error during upload: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while processing the document: {str(e)}"
        )


@router.get(
    "",
    response_model=DocumentListResponse,
    summary="List all uploaded documents",
)
async def list_documents():
    """Return all uploaded documents with metadata."""
    documents = document_store.list_documents()
    return DocumentListResponse(documents=documents, total=len(documents))


@router.delete(
    "/{document_id}",
    response_model=DeleteDocumentResponse,
    summary="Delete a document and its vectors",
)
async def delete_document(document_id: str):
    """
    Delete a document and remove its chunks from ChromaDB.
    Also removes the physical file from disk.
    """
    # Check document exists
    doc = document_store.get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found."
        )

    # Remove vectors from ChromaDB
    chunks_removed = vector_service.delete_document(document_id)

    # Remove physical file
    from app.config import get_settings
    upload_dir = get_settings().upload_directory
    file_path = os.path.join(upload_dir, doc.filename)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            logger.warning(f"Could not remove file {file_path}: {e}")

    # Remove metadata
    document_store.delete_document(document_id)

    logger.info(f"Deleted document {document_id} ({doc.original_filename}), {chunks_removed} chunks removed")

    return DeleteDocumentResponse(
        message=f"Document '{doc.original_filename}' deleted successfully.",
        document_id=document_id,
        chunks_removed=chunks_removed,
    )


@router.get(
    "/stats/summary",
    response_model=StatsResponse,
    summary="Get system statistics",
)
async def get_stats():
    """Return statistics: document count, chunks, questions, storage."""
    total_docs = document_store.get_total_count()
    total_chunks = vector_service.get_total_chunks()
    total_questions = chat_history_service.get_total_questions()

    # Calculate storage used
    from app.config import get_settings
    settings = get_settings()
    storage_bytes = 0
    if os.path.exists(settings.upload_directory):
        for fname in os.listdir(settings.upload_directory):
            fpath = os.path.join(settings.upload_directory, fname)
            if os.path.isfile(fpath):
                storage_bytes += os.path.getsize(fpath)

    return StatsResponse(
        total_documents=total_docs,
        total_chunks=total_chunks,
        total_questions=total_questions,
        storage_used_mb=round(storage_bytes / (1024 * 1024), 2),
    )
