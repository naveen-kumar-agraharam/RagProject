"""
Pydantic models for documents, chat, and API schemas.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
import uuid


# ─── Document Models ────────────────────────────────────────────────────────

class DocumentBase(BaseModel):
    """Base document schema."""
    filename: str
    original_filename: str
    file_size: int
    num_pages: int
    num_chunks: int


class DocumentCreate(DocumentBase):
    """Schema for creating a document record."""
    document_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = "processed"


class DocumentResponse(DocumentBase):
    """Schema for document response."""
    document_id: str
    upload_date: datetime
    status: str

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """Schema for listing documents."""
    documents: List[DocumentResponse]
    total: int


class DeleteDocumentResponse(BaseModel):
    """Response for document deletion."""
    message: str
    document_id: str
    chunks_removed: int


# ─── Upload Response ─────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    """Response after successful upload and processing."""
    message: str
    document_id: str
    filename: str
    num_pages: int
    num_chunks: int
    processing_time_seconds: float


# ─── Chat Models ─────────────────────────────────────────────────────────────

class Source(BaseModel):
    """A source citation for an AI response."""
    document_name: str
    page_number: Optional[int] = None
    chunk_index: Optional[int] = None
    relevance_score: Optional[float] = None
    excerpt: Optional[str] = None


class ChatRequest(BaseModel):
    """Incoming chat message."""
    question: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    document_ids: Optional[List[str]] = None  # Filter to specific docs


class ChatResponse(BaseModel):
    """AI chat response with sources."""
    answer: str
    sources: List[Source]
    session_id: str
    question: str
    tokens_used: Optional[int] = None
    retrieval_time_ms: Optional[float] = None
    generation_time_ms: Optional[float] = None


class ChatMessage(BaseModel):
    """A single chat message in history."""
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    sources: Optional[List[Source]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatHistoryResponse(BaseModel):
    """Chat history response."""
    session_id: str
    messages: List[ChatMessage]
    total: int


# ─── Health Check ─────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    services: Dict[str, Any]


# ─── Error Response ───────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


# ─── Stats ───────────────────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    """Application statistics."""
    total_documents: int
    total_chunks: int
    total_questions: int
    storage_used_mb: float
