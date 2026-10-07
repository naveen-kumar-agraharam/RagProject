"""
RAG Service: Orchestrates the complete Retrieval-Augmented Generation pipeline.

Pipeline:
  Question → Embedding → ChromaDB Similarity Search → Top-K Chunks
  → Context Formatting → Gemini LLM → Answer + Source Citations
"""

import logging
import time
from typing import Dict, List, Optional, Tuple

try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document

from app.config import get_settings
from app.models.schemas import ChatResponse, Source
from app.services.llm_service import llm_service
from app.services.vector_service import vector_service

logger = logging.getLogger(__name__)
settings = get_settings()


class RAGService:
    """
    Orchestrates the complete RAG pipeline:
    1. Embed the user question
    2. Retrieve relevant chunks via similarity search
    3. Build context from retrieved chunks
    4. Generate grounded response via Gemini
    5. Return answer with source citations
    """

    def _get_conversational_response(self, question: str) -> Optional[str]:
        """
        Check if the question is a conversational greeting, pleasantry, or capability inquiry.
        Returns a friendly response if so, or None if it should go through the RAG pipeline.
        """
        import re
        q = re.sub(r"[^\w\s]", "", question.strip().lower()).strip()
        words = q.split()
        if not words:
            return None

        greetings = {
            "hi", "hello", "hey", "hola", "heya", "howdy", "sup", "yo",
            "good morning", "good afternoon", "good evening", "good day",
            "greetings",
        }
        if q in greetings or (len(words) <= 3 and words[0] in {"hi", "hello", "hey"}):
            return (
                "Hello! 👋 I am **Intellica**, your Intelligent Document Assistant.\n\n"
                "I can help you search, understand, and answer questions from your uploaded documents "
                "(such as syllabus, academic regulations, placement rules, notices, timetables, and notes).\n\n"
                "Upload a PDF or ask me any question about your documents to get started!"
            )

        identity_queries = {
            "who are you", "what is your name", "what are you", "introduce yourself",
            "tell me about yourself", "who made you", "who created you",
        }
        if q in identity_queries:
            return (
                "I am **Intellica**, an Intelligent Document Assistant powered by RAG "
                "(Retrieval-Augmented Generation) and Gemini AI.\n\n"
                "I help students and faculty quickly extract accurate answers, policies, "
                "and study materials directly from uploaded college documents with verified source citations."
            )

        capability_queries = {
            "what can you do", "how does this work", "how do you work", "help", "help me",
            "what do you do", "features",
        }
        if q in capability_queries:
            return (
                "Here is what I can do for you:\n\n"
                "• 📄 **Analyze Documents:** Upload syllabi, placement criteria, academic regulations, or lab manuals.\n"
                "• 🔍 **Instant Answers:** Ask questions in plain language and get grounded answers.\n"
                "• 📌 **Verified Citations:** Every answer cites the exact document name, page number, and relevant excerpt.\n"
                "• 💬 **Interactive Chat:** Ask follow-ups to explore your course materials and college policies.\n\n"
                "Try asking a question about your uploaded documents or upload a new PDF!"
            )

        gratitude = {"thank you", "thanks", "thanks a lot", "thank you so much", "bye", "goodbye", "see you"}
        if q in gratitude:
            return "You're very welcome! Let me know whenever you have more questions about your documents. Have a great day! 😊"

        return None

    def query(
        self,
        question: str,
        session_id: str,
        top_k: int = None,
        document_ids: Optional[List[str]] = None,
    ) -> ChatResponse:
        """
        Execute the full RAG pipeline for a user question.

        Args:
            question: The user's question
            session_id: Unique session identifier
            top_k: Number of chunks to retrieve
            document_ids: Optional list to filter specific documents

        Returns:
            ChatResponse with answer and source citations
        """
        # ── Step 0: Conversational Intent Check ─────────────────────────────
        conversational_answer = self._get_conversational_response(question)
        if conversational_answer:
            return ChatResponse(
                answer=conversational_answer,
                sources=[],
                session_id=session_id,
                question=question,
                tokens_used=None,
                retrieval_time_ms=0.0,
                generation_time_ms=0.0,
            )

        k = top_k or settings.top_k_results

        # ── Step 1: Similarity Search ───────────────────────────────────────
        retrieval_start = time.time()
        try:
            search_results = vector_service.similarity_search(
                query=question,
                top_k=k,
                document_ids=document_ids,
                score_threshold=0.0,
            )
        except Exception as e:
            logger.error(f"Retrieval failed: {e}")
            return ChatResponse(
                answer="I encountered an error while searching the documents. Please try again.",
                sources=[],
                session_id=session_id,
                question=question,
            )

        retrieval_time_ms = (time.time() - retrieval_start) * 1000

        # ── Step 2: Extract Context Chunks ─────────────────────────────────
        context_chunks = self._prepare_context(search_results)

        # ── Step 3: Generate Response via Gemini ───────────────────────────
        generation_start = time.time()
        try:
            answer, tokens_used = llm_service.generate_response(
                question=question,
                context_chunks=context_chunks,
            )
        except RuntimeError as e:
            return ChatResponse(
                answer=f"Error generating response: {str(e)}",
                sources=[],
                session_id=session_id,
                question=question,
            )

        generation_time_ms = (time.time() - generation_start) * 1000

        # ── Step 4: Build Source Citations ─────────────────────────────────
        not_found_phrases = [
            "could not find this information in the uploaded documents",
            "cannot find this information in the uploaded documents",
            "could not find any information",
            "not found in the uploaded documents",
        ]
        is_not_found = any(phrase in answer.lower() for phrase in not_found_phrases)

        if is_not_found or not context_chunks:
            sources = []
        else:
            sources = self._build_sources(search_results)
            # Only retain sources with meaningful relevance
            sources = [s for s in sources if s.relevance_score >= 0.50]

        logger.info(
            f"RAG pipeline completed | "
            f"retrieval: {retrieval_time_ms:.0f}ms | "
            f"generation: {generation_time_ms:.0f}ms | "
            f"chunks_used: {len(context_chunks)} | "
            f"sources: {len(sources)}"
        )

        return ChatResponse(
            answer=answer,
            sources=sources,
            session_id=session_id,
            question=question,
            tokens_used=tokens_used,
            retrieval_time_ms=round(retrieval_time_ms, 2),
            generation_time_ms=round(generation_time_ms, 2),
        )

    def _prepare_context(
        self,
        search_results: List[Tuple[Document, float]],
    ) -> List[Dict]:
        """
        Convert search results into context dictionaries for the LLM.
        Deduplicates chunks and sorts by relevance score.
        """
        # Sort by score descending
        sorted_results = sorted(search_results, key=lambda x: x[1], reverse=True)

        # Deduplicate by chunk content
        seen_content = set()
        context_chunks = []

        for doc, score in sorted_results:
            content_hash = hash(doc.page_content[:200])
            if content_hash in seen_content:
                continue
            seen_content.add(content_hash)

            context_chunks.append({
                "text": doc.page_content,
                "document_name": doc.metadata.get("document_name", "Unknown"),
                "page_number": doc.metadata.get("page_number"),
                "chunk_index": doc.metadata.get("chunk_index"),
                "document_id": doc.metadata.get("document_id"),
                "score": score,
            })

        return context_chunks

    def _build_sources(
        self,
        search_results: List[Tuple[Document, float]],
    ) -> List[Source]:
        """
        Build deduplicated source citations for the response.
        Groups chunks by document, keeping the highest-scoring reference per page.
        """
        seen: Dict[str, Dict] = {}  # key: "doc_name:page_num"

        for doc, score in search_results:
            doc_name = doc.metadata.get("document_name", "Unknown Document")
            page_num = doc.metadata.get("page_number")
            key = f"{doc_name}:{page_num}"

            if key not in seen or score > seen[key]["relevance_score"]:
                seen[key] = {
                    "document_name": doc_name,
                    "page_number": page_num,
                    "chunk_index": doc.metadata.get("chunk_index"),
                    "relevance_score": round(score, 3),
                    "excerpt": doc.page_content[:150] + "..." if len(doc.page_content) > 150 else doc.page_content,
                }

        # Sort by relevance score
        sorted_sources = sorted(seen.values(), key=lambda x: x["relevance_score"], reverse=True)

        return [Source(**s) for s in sorted_sources]


# Singleton instance
rag_service = RAGService()
