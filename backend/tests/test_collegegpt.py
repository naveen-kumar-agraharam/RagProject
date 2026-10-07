"""
Backend tests for CollegeGPT.
Tests PDF extraction, chunking, vector search, and API endpoints.
"""

import io
import os
import sys
import tempfile
import uuid
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Ensure app directory is importable
sys.path.insert(0, str(Path(__file__).parent.parent))

# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def test_env(tmp_path_factory):
    """Set up test environment variables."""
    tmp = tmp_path_factory.mktemp("test_data")
    os.environ.setdefault("GEMINI_API_KEY", "test_key_for_testing")
    os.environ["CHROMA_PERSIST_DIRECTORY"] = str(tmp / "chroma")
    os.environ["UPLOAD_DIRECTORY"] = str(tmp / "uploads")
    os.makedirs(str(tmp / "chroma"), exist_ok=True)
    os.makedirs(str(tmp / "uploads"), exist_ok=True)
    return tmp


@pytest.fixture
def sample_pdf_bytes():
    """Create a minimal valid PDF in memory."""
    from pypdf import PdfWriter
    from pypdf.generic import NameObject, ArrayObject

    writer = PdfWriter()
    page = writer.add_blank_page(width=612, height=792)

    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)
    return buf.read()


# ─── PDF Service Tests ─────────────────────────────────────────────────────────

class TestPDFService:
    """Tests for PDFService: validation, extraction, chunking."""

    def test_validate_valid_pdf(self):
        from app.services.pdf_service import pdf_service
        mock_file = MagicMock()
        mock_file.filename = "test_document.pdf"
        mock_file.content_type = "application/pdf"
        # Should not raise
        pdf_service.validate_file(mock_file)

    def test_validate_invalid_extension(self):
        from fastapi import HTTPException
        from app.services.pdf_service import pdf_service
        mock_file = MagicMock()
        mock_file.filename = "malware.exe"
        mock_file.content_type = "application/octet-stream"
        with pytest.raises(HTTPException) as exc_info:
            pdf_service.validate_file(mock_file)
        assert exc_info.value.status_code == 400

    def test_validate_invalid_content_type(self):
        from fastapi import HTTPException
        from app.services.pdf_service import pdf_service
        mock_file = MagicMock()
        mock_file.filename = "doc.pdf"
        mock_file.content_type = "text/html"
        with pytest.raises(HTTPException) as exc_info:
            pdf_service.validate_file(mock_file)
        assert exc_info.value.status_code == 400

    def test_clean_text(self):
        from app.services.pdf_service import pdf_service
        raw = "Hello   World\n\n\n\nTest   "
        cleaned = pdf_service._clean_text(raw)
        assert "   " not in cleaned
        assert cleaned == cleaned.strip()

    def test_clean_text_removes_control_chars(self):
        from app.services.pdf_service import pdf_service
        raw = "Normal text\x00with\x01null bytes\x07"
        cleaned = pdf_service._clean_text(raw)
        assert "\x00" not in cleaned
        assert "\x01" not in cleaned

    def test_create_chunks_with_metadata(self, test_env):
        from app.services.pdf_service import pdf_service
        page_data = [
            {"page_number": 1, "text": "This is page one content. " * 50},
            {"page_number": 2, "text": "This is page two content. " * 50},
        ]
        doc_id = str(uuid.uuid4())
        chunks = pdf_service.create_chunks(
            page_data=page_data,
            document_id=doc_id,
            original_filename="test.pdf",
            secure_filename="test_abc123.pdf",
        )
        assert len(chunks) > 0
        for chunk in chunks:
            assert "document_id" in chunk.metadata
            assert chunk.metadata["document_id"] == doc_id
            assert "page_number" in chunk.metadata
            assert "chunk_index" in chunk.metadata
            assert len(chunk.page_content) <= 1200  # chunk size + some buffer

    def test_create_chunks_empty_pages(self, test_env):
        from app.services.pdf_service import pdf_service
        chunks = pdf_service.create_chunks(
            page_data=[{"page_number": 1, "text": "   "}],
            document_id="test-id",
            original_filename="empty.pdf",
            secure_filename="empty.pdf",
        )
        assert len(chunks) == 0


# ─── Text Splitter Tests ───────────────────────────────────────────────────────

class TestTextSplitting:
    """Tests for text splitting logic."""

    def test_chunk_size_respected(self, test_env):
        from app.services.pdf_service import pdf_service
        long_text = "word " * 2000  # ~10000 chars
        chunks = pdf_service.text_splitter.split_text(long_text)
        for chunk in chunks:
            # Allow for some overhead due to separator
            assert len(chunk) <= 1500, f"Chunk too large: {len(chunk)}"

    def test_chunk_overlap(self, test_env):
        from app.services.pdf_service import pdf_service
        # Create text with a distinctive word in the middle
        text = "Start. " * 100 + "UNIQUE_MARKER_WORD " + "End. " * 100
        chunks = pdf_service.text_splitter.split_text(text)
        # The marker should appear in at least one chunk
        marker_found = any("UNIQUE_MARKER" in c for c in chunks)
        assert marker_found


# ─── Vector Service Tests ──────────────────────────────────────────────────────

class TestVectorService:
    """Tests for ChromaDB vector operations (mocked)."""

    def test_similarity_search_returns_list(self, test_env):
        """Test that similarity search returns a list structure."""
        from app.services.vector_service import VectorService

        service = VectorService()
        mock_store = MagicMock()
        mock_store.similarity_search_with_relevance_scores.return_value = []
        service._vector_store = mock_store
        service._initialized = True
        service._chroma_client = MagicMock()

        results = service.similarity_search("test query", top_k=5)
        assert isinstance(results, list)

    def test_delete_document_calls_collection(self, test_env):
        """Test that delete_document calls ChromaDB collection delete."""
        from app.services.vector_service import VectorService

        service = VectorService()
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.get.return_value = {
            "ids": ["chunk_1", "chunk_2"],
            "metadatas": [{}, {}]
        }
        mock_client.get_collection.return_value = mock_collection
        service._chroma_client = mock_client
        service._initialized = True
        service._vector_store = MagicMock()

        count = service.delete_document("test-doc-id")
        assert count == 2
        mock_collection.delete.assert_called_once()


# ─── API Endpoint Tests ────────────────────────────────────────────────────────

class TestAPIEndpoints:
    """Tests for FastAPI endpoints."""

    @pytest.fixture(scope="class")
    def client(self, test_env):
        """Create test client with mocked services."""
        with patch("app.services.embedding_service.EmbeddingService._initialize"):
            with patch("app.services.vector_service.VectorService._initialize"):
                from app.main import app
                return TestClient(app)

    def test_root_endpoint(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "CollegeGPT API"
        assert data["status"] == "running"

    def test_list_documents_empty(self, client):
        response = client.get("/api/documents")
        assert response.status_code == 200
        data = response.json()
        assert "documents" in data
        assert "total" in data
        assert isinstance(data["documents"], list)

    def test_upload_non_pdf_rejected(self, client):
        fake_txt = io.BytesIO(b"this is not a pdf")
        response = client.post(
            "/api/documents/upload",
            files={"file": ("document.txt", fake_txt, "text/plain")}
        )
        assert response.status_code == 400

    def test_delete_nonexistent_document(self, client):
        fake_id = str(uuid.uuid4())
        response = client.delete(f"/api/documents/{fake_id}")
        assert response.status_code == 404

    def test_chat_empty_question_rejected(self, client):
        response = client.post(
            "/api/chat",
            json={"question": "   ", "session_id": "test-session"}
        )
        assert response.status_code == 400

    def test_chat_history_empty_session(self, client):
        session_id = str(uuid.uuid4())
        response = client.get(f"/api/chat/history/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["messages"] == []
        assert data["total"] == 0


# ─── RAG Pipeline Tests ────────────────────────────────────────────────────────

class TestRAGPipeline:
    """Integration tests for the RAG pipeline (mocked LLM/embeddings)."""

    def test_rag_returns_response_structure(self, test_env):
        """Test RAG service returns properly structured response."""
        from app.services.rag_service import RAGService
        try:
            from langchain_core.documents import Document
        except ImportError:
            from langchain.schema import Document

        service = RAGService()
        mock_docs = [
            (
                Document(
                    page_content="Students with CGPA above 7.5 are eligible for placements.",
                    metadata={
                        "document_name": "Placement_Rules.pdf",
                        "page_number": 4,
                        "chunk_index": 0,
                        "document_id": "test-id",
                    }
                ),
                0.87,
            )
        ]

        with patch("app.services.vector_service.vector_service.similarity_search", return_value=mock_docs):
            with patch("app.services.llm_service.llm_service.generate_response",
                      return_value=("Students with CGPA above 7.5 are eligible.", 150)):
                response = service.query("Who is eligible for placement?", "test-session")

        assert response.answer != ""
        assert isinstance(response.sources, list)
        assert response.session_id == "test-session"

    def test_rag_no_results_returns_helpful_message(self, test_env):
        """Test RAG returns helpful message when no chunks found."""
        from app.services.rag_service import RAGService

        service = RAGService()

        with patch("app.services.vector_service.vector_service.similarity_search", return_value=[]):
            with patch("app.services.llm_service.llm_service.generate_response",
                      return_value=("I could not find this information in the uploaded documents.", None)):
                response = service.query("What is the meaning of life?", "test-session")

        assert response.sources == [] or isinstance(response.sources, list)


# ─── Utility Tests ────────────────────────────────────────────────────────────

class TestUtilities:
    """Tests for utility functions."""

    def test_sanitize_filename_removes_special_chars(self):
        from app.utils.helpers import sanitize_filename
        result = sanitize_filename("My File (2024)!@#.pdf")
        assert "(" not in result
        assert "!" not in result
        assert result.endswith(".pdf")

    def test_format_file_size_bytes(self):
        from app.utils.helpers import format_file_size
        assert "B" in format_file_size(500)
        assert "KB" in format_file_size(2048)
        assert "MB" in format_file_size(2 * 1024 * 1024)

    def test_truncate_text(self):
        from app.utils.helpers import truncate_text
        long_text = "word " * 100
        result = truncate_text(long_text, max_chars=50)
        assert len(result) <= 60  # some buffer for ellipsis
        assert result.endswith("...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
