"""
Vector Service: Manages ChromaDB vector store operations.
Handles storing, retrieving, and deleting document chunks with metadata.
"""

import logging
import os
from typing import Any, Dict, List, Optional, Tuple

import chromadb
from chromadb.config import Settings as ChromaSettings
try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document
from langchain_chroma import Chroma

from app.config import get_settings
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)
settings = get_settings()


class VectorService:
    """
    Manages ChromaDB vector store for document chunk storage and retrieval.
    Uses LangChain's Chroma wrapper for seamless integration.
    """

    def __init__(self):
        self._chroma_client: Optional[chromadb.PersistentClient] = None
        self._vector_store: Optional[Chroma] = None
        self._initialized = False

    def _initialize(self) -> None:
        """Lazy-initialize ChromaDB client and vector store."""
        if self._initialized:
            return

        try:
            os.makedirs(settings.chroma_persist_directory, exist_ok=True)

            # Initialize persistent ChromaDB client
            self._chroma_client = chromadb.PersistentClient(
                path=settings.chroma_persist_directory,
                settings=ChromaSettings(anonymized_telemetry=False)
            )

            # Initialize LangChain Chroma wrapper
            self._vector_store = Chroma(
                client=self._chroma_client,
                collection_name=settings.chroma_collection_name,
                embedding_function=embedding_service.get_embeddings(),
            )

            self._initialized = True
            logger.info(
                f"ChromaDB initialized at: {settings.chroma_persist_directory}, "
                f"collection: {settings.chroma_collection_name}"
            )
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise RuntimeError(f"Vector store initialization failed: {str(e)}")

    def get_vector_store(self) -> Chroma:
        """Return initialized vector store."""
        self._initialize()
        return self._vector_store

    def add_documents(self, documents: List[Document], document_id: str) -> int:
        """
        Add document chunks to the vector store.
        Returns count of chunks added.
        """
        self._initialize()

        if not documents:
            return 0

        try:
            # Generate unique IDs for each chunk to prevent duplicates
            ids = [
                f"{document_id}_chunk_{doc.metadata.get('chunk_index', i)}"
                for i, doc in enumerate(documents)
            ]

            self._vector_store.add_documents(documents=documents, ids=ids)
            logger.info(f"Added {len(documents)} chunks for document {document_id}")
            return len(documents)

        except Exception as e:
            logger.error(f"Failed to add documents to vector store: {e}")
            raise RuntimeError(f"Failed to store document vectors: {str(e)}")

    def similarity_search(
        self,
        query: str,
        top_k: int = None,
        document_ids: Optional[List[str]] = None,
        score_threshold: float = 0.0,
    ) -> List[Tuple[Document, float]]:
        """
        Perform similarity search for the given query.
        Returns list of (Document, score) tuples sorted by relevance.
        """
        self._initialize()
        k = top_k or settings.top_k_results

        try:
            # Build filter if specific documents are requested
            where_filter = None
            if document_ids:
                if len(document_ids) == 1:
                    where_filter = {"document_id": {"$eq": document_ids[0]}}
                else:
                    where_filter = {"document_id": {"$in": document_ids}}

            try:
                raw_results = self._vector_store.similarity_search_with_relevance_scores(
                    query=query,
                    k=k,
                    filter=where_filter,
                )
            except Exception:
                raw_results = []

            # If no results or fallback needed, use similarity_search_with_score or similarity_search
            if not raw_results:
                try:
                    raw_scores = self._vector_store.similarity_search_with_score(
                        query=query,
                        k=k,
                        filter=where_filter,
                    )
                    raw_results = [(doc, 1.0 / (1.0 + max(0.0, float(dist)))) for doc, dist in raw_scores]
                except Exception:
                    plain_docs = self._vector_store.similarity_search(query=query, k=k, filter=where_filter)
                    raw_results = [(doc, 0.75) for doc in plain_docs]

            # Normalize scores between 0 and 1 for clean UI display
            filtered = []
            for doc, score in raw_results:
                # If negative (e.g. raw distance), map into [0.1, 0.99]
                if score < 0:
                    norm_score = round(max(0.05, 1.0 / (1.0 + abs(score))), 3)
                elif score > 1.0:
                    norm_score = round(1.0 / (1.0 + score), 3)
                else:
                    norm_score = round(max(0.05, score), 3)
                filtered.append((doc, norm_score))

            logger.info(f"Similarity search returned {len(filtered)} results for query: '{query[:50]}...'")
            return filtered

        except Exception as e:
            logger.error(f"Similarity search failed: {e}")
            raise RuntimeError(f"Vector search failed: {str(e)}")

    def delete_document(self, document_id: str) -> int:
        """
        Delete all chunks belonging to a document from the vector store.
        Returns count of chunks deleted.
        """
        self._initialize()

        try:
            collection = self._chroma_client.get_collection(
                name=settings.chroma_collection_name
            )

            # Get all chunk IDs for this document
            results = collection.get(
                where={"document_id": {"$eq": document_id}},
                include=["metadatas"],
            )

            ids_to_delete = results.get("ids", [])

            if ids_to_delete:
                collection.delete(ids=ids_to_delete)
                logger.info(f"Deleted {len(ids_to_delete)} chunks for document {document_id}")

            return len(ids_to_delete)

        except Exception as e:
            logger.error(f"Failed to delete document vectors: {e}")
            raise RuntimeError(f"Vector deletion failed: {str(e)}")

    def document_exists(self, document_id: str) -> bool:
        """Check if a document already has vectors in the store."""
        self._initialize()
        try:
            collection = self._chroma_client.get_collection(
                name=settings.chroma_collection_name
            )
            results = collection.get(
                where={"document_id": {"$eq": document_id}},
                limit=1,
                include=["metadatas"],
            )
            return len(results.get("ids", [])) > 0
        except Exception:
            return False

    def get_total_chunks(self) -> int:
        """Get total number of chunks stored."""
        self._initialize()
        try:
            collection = self._chroma_client.get_collection(
                name=settings.chroma_collection_name
            )
            return collection.count()
        except Exception:
            return 0

    def get_document_chunk_count(self, document_id: str) -> int:
        """Get number of chunks for a specific document."""
        self._initialize()
        try:
            collection = self._chroma_client.get_collection(
                name=settings.chroma_collection_name
            )
            results = collection.get(
                where={"document_id": {"$eq": document_id}},
                include=["metadatas"],
            )
            return len(results.get("ids", []))
        except Exception:
            return 0

    def check_health(self) -> bool:
        """Check if vector store is operational."""
        try:
            self._initialize()
            return True
        except Exception:
            return False


# Singleton instance
vector_service = VectorService()
