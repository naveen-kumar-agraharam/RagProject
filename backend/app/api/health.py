"""
Health check API endpoint.
"""

from fastapi import APIRouter

from app.config import get_settings
from app.models.schemas import HealthResponse
from app.services.embedding_service import embedding_service
from app.services.llm_service import llm_service
from app.services.vector_service import vector_service

router = APIRouter(prefix="/api", tags=["Health"])
settings = get_settings()


@router.api_route(
    "/health",
    methods=["GET", "HEAD"],
    response_model=HealthResponse,
    summary="System health check",
)
async def health_check():
    """
    Check the status of all backend services:
    - ChromaDB vector store
    - Gemini LLM
    - Embedding service
    """
    services = {
        "vector_store": "ok" if vector_service.check_health() else "error",
        "llm": "ok" if llm_service.check_health() else "error",
        "embeddings": "ok" if embedding_service.check_health() else "error",
    }

    overall_status = "healthy" if all(v == "ok" for v in services.values()) else "degraded"

    return HealthResponse(
        status=overall_status,
        version=settings.version,
        services=services,
    )
