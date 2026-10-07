"""
Chat history service: In-memory with JSON persistence.
Stores conversation history per session.
"""

import json
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional

from app.config import get_settings
from app.models.schemas import ChatMessage, ChatHistoryResponse

logger = logging.getLogger(__name__)
settings = get_settings()

CHAT_HISTORY_FILE = os.path.join(settings.chroma_persist_directory, "chat_history.json")


class ChatHistoryService:
    """Manages chat session history with file persistence."""

    def __init__(self):
        self._sessions: Dict[str, List[dict]] = {}
        self._question_count: int = 0
        self._loaded = False

    def _load(self) -> None:
        if self._loaded:
            return
        if os.path.exists(CHAT_HISTORY_FILE):
            try:
                with open(CHAT_HISTORY_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._sessions = data.get("sessions", {})
                    self._question_count = data.get("question_count", 0)
            except Exception as e:
                logger.error(f"Failed to load chat history: {e}")
                self._sessions = {}
        self._loaded = True

    def _save(self) -> None:
        try:
            os.makedirs(os.path.dirname(CHAT_HISTORY_FILE), exist_ok=True)
            with open(CHAT_HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump(
                    {"sessions": self._sessions, "question_count": self._question_count},
                    f, indent=2, default=str
                )
        except Exception as e:
            logger.error(f"Failed to save chat history: {e}")

    def add_message(self, message: ChatMessage) -> None:
        """Add a message to a session."""
        self._load()
        session_id = message.session_id
        if session_id not in self._sessions:
            self._sessions[session_id] = []

        msg_dict = {
            "message_id": message.message_id,
            "session_id": message.session_id,
            "role": message.role,
            "content": message.content,
            "sources": [s.dict() for s in message.sources] if message.sources else [],
            "timestamp": message.timestamp.isoformat(),
        }
        self._sessions[session_id].append(msg_dict)

        if message.role == "user":
            self._question_count += 1

        self._save()

    def get_history(self, session_id: str) -> ChatHistoryResponse:
        """Get all messages for a session."""
        self._load()
        raw_messages = self._sessions.get(session_id, [])
        messages = []
        for m in raw_messages:
            msg = ChatMessage(
                message_id=m["message_id"],
                session_id=m["session_id"],
                role=m["role"],
                content=m["content"],
                sources=m.get("sources", []),
                timestamp=datetime.fromisoformat(m["timestamp"]),
            )
            messages.append(msg)
        return ChatHistoryResponse(
            session_id=session_id,
            messages=messages,
            total=len(messages),
        )

    def clear_history(self, session_id: str) -> bool:
        """Clear history for a session. Returns True if existed."""
        self._load()
        if session_id in self._sessions:
            del self._sessions[session_id]
            self._save()
            return True
        return False

    def clear_all_history(self) -> int:
        """Clear all chat history across all sessions. Returns count of cleared sessions."""
        self._load()
        count = len(self._sessions)
        self._sessions = {}
        self._save()
        return count

    def get_all_sessions(self) -> List[str]:
        """List all session IDs."""
        self._load()
        return list(self._sessions.keys())

    def get_total_questions(self) -> int:
        """Get total number of questions asked across all sessions."""
        self._load()
        return self._question_count


# Singleton instance
chat_history_service = ChatHistoryService()
