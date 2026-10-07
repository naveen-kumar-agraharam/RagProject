"""
CollegeGPT FastAPI Application Entry Point.

Configures the FastAPI app with:
- CORS middleware
- API routers
- Startup/shutdown events
- Global exception handlers
- Request logging
"""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import chat, documents, health
from app.config import ensure_directories, get_settings

# ─── Logging ─────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("collegegpt")

settings = get_settings()


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    logger.info("╔══════════════════════════════════════╗")
    logger.info("║      CollegeGPT Backend Starting     ║")
    logger.info("╚══════════════════════════════════════╝")

    ensure_directories()
    logger.info(f"Upload directory: {settings.upload_directory}")
    logger.info(f"ChromaDB directory: {settings.chroma_persist_directory}")
    logger.info(f"Using LLM: {settings.gemini_model}")
    logger.info(f"Using embedding: {settings.embedding_model}")

    yield

    # Shutdown
    logger.info("CollegeGPT Backend shutting down...")


# ─── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="CollegeGPT API",
    description="AI-powered college document assistant using RAG (Retrieval-Augmented Generation)",
    version=settings.version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ─── CORS ─────────────────────────────────────────────────────────────────────

cors_origins = settings.cors_origins
if "*" in cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )


# ─── Request Logging Middleware ───────────────────────────────────────────────

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests with timing."""
    start = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000
    logger.info(
        f"{request.method} {request.url.path} "
        f"→ {response.status_code} [{duration:.0f}ms]"
    )
    return response


# ─── Global Exception Handlers ────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred.",
        },
    )


# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(health.router)
app.include_router(documents.router)
app.include_router(chat.router)


# ─── Root Endpoint ────────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
async def root():
    """API root - returns basic info."""
    return {
        "name": "CollegeGPT API",
        "version": settings.version,
        "status": "running",
        "docs": "/docs",
        "health": "/api/health",
    }
