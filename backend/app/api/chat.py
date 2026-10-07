"""
Chat API: Question answering and chat history endpoints.
"""

import logging
import uuid
from datetime import datetime

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.models.schemas import (
    ChatHistoryResponse,
    ChatMessage,
    ChatRequest,
    ChatResponse,
)
from app.services.chat_history_service import chat_history_service
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post(
    "",
    response_model=ChatResponse,
    summary="Ask a question about uploaded documents",
)
async def chat(request: ChatRequest):
    """
    Process a user question through the RAG pipeline:
    1. Embed the question
    2. Retrieve relevant document chunks
    3. Generate a grounded Gemini response
    4. Return the answer with source citations
    """
    if not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )

    session_id = request.session_id or str(uuid.uuid4())

    try:
        # Execute RAG pipeline
        response = rag_service.query(
            question=request.question.strip(),
            session_id=session_id,
            document_ids=request.document_ids,
        )

        # Persist user message to history
        user_msg = ChatMessage(
            session_id=session_id,
            role="user",
            content=request.question.strip(),
            timestamp=datetime.utcnow(),
        )
        chat_history_service.add_message(user_msg)

        # Persist assistant message to history
        assistant_msg = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=response.answer,
            sources=response.sources,
            timestamp=datetime.utcnow(),
        )
        chat_history_service.add_message(assistant_msg)

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process question: {str(e)}"
        )


@router.get(
    "/history",
    response_model=ChatHistoryResponse,
    summary="Get chat history (by optional session_id query param)",
)
async def get_history(session_id: Optional[str] = Query(default=None, description="Chat session ID")):
    """Retrieve chat history. If session_id is omitted, returns history for 'default' session."""
    target_session = session_id or "default"
    return chat_history_service.get_history(target_session)


@router.delete(
    "/history",
    summary="Clear chat history (by optional session_id query param or all)",
)
async def clear_history(session_id: Optional[str] = Query(default=None, description="Session ID to clear, or omit to clear all")):
    """Clear chat history for a session or across all sessions."""
    if session_id:
        deleted = chat_history_service.clear_history(session_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session '{session_id}' not found or already empty."
            )
        return {"message": f"Chat history for session '{session_id}' cleared successfully."}
    else:
        cleared_count = chat_history_service.clear_all_history()
        return {"message": f"All chat histories cleared ({cleared_count} sessions)."}


@router.get(
    "/history/{session_id}",
    response_model=ChatHistoryResponse,
    summary="Get chat history for a session",
)
async def get_chat_history(session_id: str):
    """Retrieve all messages for a given session."""
    history = chat_history_service.get_history(session_id)
    return history


@router.delete(
    "/history/{session_id}",
    summary="Clear chat history for a session",
)
async def clear_chat_history(session_id: str):
    """Clear all messages for a given session."""
    deleted = chat_history_service.clear_history(session_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found or already empty."
        )
    return {"message": f"Chat history for session '{session_id}' cleared successfully."}
