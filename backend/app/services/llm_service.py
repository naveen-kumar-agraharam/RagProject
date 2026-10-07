"""
LLM Service: Interfaces with Google Gemini for response generation.
Implements strict prompt grounding to prevent hallucination.
"""

import logging
import time
from typing import Dict, List, Optional, Tuple

import google.generativeai as genai
try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


# ─── System Prompt ───────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are Intellica, an Intelligent Document Assistant specialized in answering questions about college and academic documents.

Your PRIMARY RULES:
1. Answer questions about documents, courses, syllabus, regulations, policies, or topics using the provided context from uploaded documents.
2. If the user asks a specific question about documents or academic information and the answer cannot be found in the provided context, respond with:
   "I could not find this information in the uploaded documents. Please check the relevant document directly or consult your college administration."
3. For general friendly greetings or conversational messages, respond warmly, politely, and helpfully as Intellica, letting the user know they can ask questions about their documents or upload new ones.
4. NEVER invent, guess, or hallucinate facts that are not explicitly stated in the context for document-related queries.
5. Be accurate, concise, and helpful.
6. When quoting specific rules, regulations, numbers, or dates, be precise.
7. Format your response clearly using markdown when appropriate.

Remember: Accuracy is paramount for academic and institutional questions."""


def build_prompt(question: str, context_chunks: List[Dict]) -> str:
    """
    Build the final prompt by combining system instructions, context, and user question.
    """
    context_text = ""
    for i, chunk in enumerate(context_chunks, start=1):
        doc_name = chunk.get("document_name", "Unknown Document")
        page_num = chunk.get("page_number", "?")
        text = chunk.get("text", "")
        context_text += f"\n--- Source {i}: {doc_name} (Page {page_num}) ---\n{text}\n"

    prompt = f"""{SYSTEM_PROMPT}

═══════════════════════════════════════
RETRIEVED CONTEXT FROM UPLOADED DOCUMENTS:
═══════════════════════════════════════
{context_text}
═══════════════════════════════════════

Student's Question: {question}

Answer (based strictly on the context above):"""

    return prompt


class LLMService:
    """
    Service for generating AI responses using Google Gemini.
    """

    def __init__(self):
        self._model = None
        self._initialized = False

    def _initialize(self) -> None:
        """Lazy-initialize the Gemini model."""
        if self._initialized:
            return

        has_gemini_key = (
            bool(settings.gemini_api_key) and
            settings.gemini_api_key != "your_gemini_api_key_here"
        )
        if not has_gemini_key:
            logger.warning("No Gemini API key configured. RAG will provide direct grounded context.")
            return

        try:
            genai.configure(api_key=settings.gemini_api_key)

            generation_config = genai.types.GenerationConfig(
                temperature=settings.temperature,
                max_output_tokens=settings.max_tokens,
                top_p=0.8,
                top_k=40,
            )

            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]

            self._model = genai.GenerativeModel(
                model_name=settings.gemini_model,
                generation_config=generation_config,
                safety_settings=safety_settings,
            )

            self._initialized = True
            logger.info(f"LLM Service initialized with model: {settings.gemini_model}")

        except Exception as e:
            logger.error(f"Failed to initialize Gemini LLM: {e}")
            raise RuntimeError(f"LLM initialization failed: {str(e)}")

    def generate_response(
        self,
        question: str,
        context_chunks: List[Dict],
    ) -> Tuple[str, Optional[int]]:
        """
        Generate a grounded response using Gemini.

        Args:
            question: The user's question
            context_chunks: List of retrieved context chunks with metadata

        Returns:
            Tuple of (answer_text, tokens_used)
        """
        if not context_chunks:
            return (
                "I could not find this information in the uploaded documents. "
                "Please upload relevant documents and try again.",
                None,
            )

        has_gemini_key = (
            bool(settings.gemini_api_key) and
            settings.gemini_api_key != "your_gemini_api_key_here"
        )

        if not has_gemini_key:
            # Build grounded response directly from retrieved chunks
            snippets = []
            for c in context_chunks[:3]:
                doc_name = c.get("document_name", "Document")
                page_num = c.get("page_number", "?")
                text = c.get("text", "").strip()
                snippets.append(f"📄 **{doc_name} (Page {page_num}):**\n> {text}")

            combined_snippets = "\n\n".join(snippets)
            answer = (
                f"### Relevant Excerpts Found in Documents:\n\n"
                f"{combined_snippets}\n\n"
                f"---\n"
                f"💡 *Tip: Configure your `GEMINI_API_KEY` in `backend/.env` for synthesized conversational responses.*"
            )
            return answer, None

        self._initialize()

        prompt = build_prompt(question, context_chunks)

        try:
            response = self._model.generate_content(prompt)

            # Extract text safely
            answer = ""
            if response.candidates:
                candidate = response.candidates[0]
                if candidate.content and candidate.content.parts:
                    answer = "".join(
                        part.text for part in candidate.content.parts
                        if hasattr(part, "text")
                    )

            if not answer:
                answer = (
                    "I could not generate a response. "
                    "Please try rephrasing your question."
                )

            # Get token count if available
            tokens_used = None
            try:
                tokens_used = response.usage_metadata.total_token_count
            except Exception:
                pass

            return answer.strip(), tokens_used

        except Exception as e:
            logger.error(f"Gemini generation failed: {e}")
            error_msg = str(e).lower()

            if "quota" in error_msg or "rate" in error_msg:
                raise RuntimeError("API rate limit exceeded. Please wait a moment and try again.")
            elif "api key" in error_msg or "invalid" in error_msg:
                raise RuntimeError("Invalid Gemini API key. Please check your configuration.")
            else:
                raise RuntimeError(f"AI generation failed: {str(e)}")

    def check_health(self) -> bool:
        """Check if LLM service is operational."""
        try:
            self._initialize()
            # Quick token count test without generating
            test = self._model.count_tokens("health check")
            return test.total_tokens > 0
        except Exception:
            return False


# Singleton instance
llm_service = LLMService()
