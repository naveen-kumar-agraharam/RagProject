"""
Embedding Service: Generates vector embeddings using Google Gemini Embedding API.
Falls back to Sentence Transformers if Gemini embedding fails.
"""

import logging
import time
from typing import List, Optional

import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class EmbeddingService:
    """
    Manages embedding generation using Google Gemini Embedding API.
    Provides methods compatible with LangChain's embeddings interface.
    """

    def __init__(self):
        self._embeddings: Optional[GoogleGenerativeAIEmbeddings] = None
        self._initialized = False

    def _initialize(self) -> None:
        """Lazy-initialize the embedding model with automatic SentenceTransformers fallback."""
        if self._initialized:
            return

        has_gemini_key = (
            bool(settings.gemini_api_key) and
            settings.gemini_api_key != "your_gemini_api_key_here"
        )

        if has_gemini_key:
            try:
                genai.configure(api_key=settings.gemini_api_key)
                self._embeddings = GoogleGenerativeAIEmbeddings(
                    model=settings.embedding_model,
                    google_api_key=settings.gemini_api_key,
                    task_type="retrieval_document",
                )
                self._initialized = True
                logger.info(f"Gemini embedding service initialized with model: {settings.embedding_model}")
                return
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini embeddings: {e}. Falling back to SentenceTransformers.")

        # Fallback to local HuggingFace / Sentence Transformers
        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings
            self._embeddings = HuggingFaceEmbeddings(
                model_name="all-MiniLM-L6-v2",
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True},
            )
            self._initialized = True
            logger.info("Local SentenceTransformers (all-MiniLM-L6-v2) embedding service initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize local fallback embeddings: {e}")
            raise RuntimeError(f"Embedding service initialization failed: {str(e)}")

    def get_embeddings(self) -> GoogleGenerativeAIEmbeddings:
        """Return the LangChain-compatible embeddings object."""
        self._initialize()
        return self._embeddings

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        Returns list of embedding vectors.
        """
        self._initialize()
        try:
            embeddings = self._embeddings.embed_documents(texts)
            return embeddings
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise RuntimeError(f"Failed to generate embeddings: {str(e)}")

    def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for a single query.
        """
        self._initialize()
        try:
            return self._embeddings.embed_query(query)
        except Exception as e:
            logger.error(f"Query embedding failed: {e}")
            raise RuntimeError(f"Failed to embed query: {str(e)}")

    def check_health(self) -> bool:
        """Check if embedding service is operational."""
        try:
            self._initialize()
            test_embedding = self._embeddings.embed_query("health check")
            return len(test_embedding) > 0
        except Exception:
            return False


# Singleton instance
embedding_service = EmbeddingService()
