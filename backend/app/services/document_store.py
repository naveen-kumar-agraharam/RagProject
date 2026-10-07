"""
Document Store: In-memory + JSON file-based document metadata store.
Persists document metadata to disk so it survives server restarts.
MongoDB can be used as an alternative if configured.
"""

import json
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional

from app.config import get_settings
from app.models.schemas import DocumentCreate, DocumentResponse

logger = logging.getLogger(__name__)
settings = get_settings()

METADATA_FILE = os.path.join(settings.chroma_persist_directory, "documents_metadata.json")


class DocumentStore:
    """
    Manages document metadata persistence.
    Stores document records in a JSON file for simplicity and portability.
    """

    def __init__(self):
        self._documents: Dict[str, dict] = {}
        self._loaded = False

    def _load(self) -> None:
        """Load documents metadata from disk."""
        if self._loaded:
            return

        if os.path.exists(METADATA_FILE):
            try:
                with open(METADATA_FILE, "r", encoding="utf-8") as f:
                    self._documents = json.load(f)
                logger.info(f"Loaded {len(self._documents)} documents from metadata store")
            except Exception as e:
                logger.error(f"Failed to load metadata: {e}")
                self._documents = {}

        self._loaded = True

    def _save(self) -> None:
        """Persist documents metadata to disk."""
        try:
            os.makedirs(os.path.dirname(METADATA_FILE), exist_ok=True)
            with open(METADATA_FILE, "w", encoding="utf-8") as f:
                json.dump(self._documents, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Failed to save metadata: {e}")

    def add_document(self, doc: DocumentCreate) -> DocumentResponse:
        """Add a new document record."""
        self._load()

        record = {
            "document_id": doc.document_id,
            "filename": doc.filename,
            "original_filename": doc.original_filename,
            "file_size": doc.file_size,
            "num_pages": doc.num_pages,
            "num_chunks": doc.num_chunks,
            "upload_date": doc.upload_date.isoformat(),
            "status": doc.status,
        }

        self._documents[doc.document_id] = record
        self._save()

        return DocumentResponse(**{**record, "upload_date": doc.upload_date})

    def get_document(self, document_id: str) -> Optional[DocumentResponse]:
        """Get a specific document by ID."""
        self._load()
        record = self._documents.get(document_id)
        if not record:
            return None
        r = dict(record)
        r["upload_date"] = datetime.fromisoformat(r["upload_date"])
        return DocumentResponse(**r)

    def list_documents(self) -> List[DocumentResponse]:
        """List all documents sorted by upload date (newest first)."""
        self._load()
        docs = []
        for record in self._documents.values():
            r = dict(record)
            r["upload_date"] = datetime.fromisoformat(r["upload_date"])
            docs.append(DocumentResponse(**r))
        return sorted(docs, key=lambda d: d.upload_date, reverse=True)

    def delete_document(self, document_id: str) -> bool:
        """Delete a document record. Returns True if found and deleted."""
        self._load()
        if document_id in self._documents:
            del self._documents[document_id]
            self._save()
            return True
        return False

    def document_exists_by_filename(self, original_filename: str) -> Optional[str]:
        """Check if a document with this filename already exists. Returns document_id or None."""
        self._load()
        for doc_id, record in self._documents.items():
            if record.get("original_filename") == original_filename:
                return doc_id
        return None

    def get_total_count(self) -> int:
        """Get total number of stored documents."""
        self._load()
        return len(self._documents)

    def update_chunk_count(self, document_id: str, num_chunks: int) -> None:
        """Update the chunk count for a document after processing."""
        self._load()
        if document_id in self._documents:
            self._documents[document_id]["num_chunks"] = num_chunks
            self._save()


# Singleton instance
document_store = DocumentStore()
