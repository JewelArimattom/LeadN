"""CallPilot FastAPI Backend - Main application entry point."""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, close_db

# Import all models so SQLAlchemy registers them
from app.models.user import User  # noqa: F401
from app.models.contact import Contact  # noqa: F401
from app.models.call import (  # noqa: F401
    CallRecord, Recording, Transcript, TranscriptSegment, ConversationSummary,
)
from app.models.extras import (  # noqa: F401
    Note, Reminder, Task, Tag, ContactTag, AIInsight, NotificationLog,
)

# Import routers
from app.routers import auth, contacts, calls, notes, reminders, ai, analytics, shared


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Initialize database tables
    if settings.MONGODB_URI:
        print("Shared MongoDB mode enabled for website accounts, leads, and mobile call history")
    else:
        await init_db()
        print("Legacy SQL database initialized")
    print(f"CallPilot API running on {settings.HOST}:{settings.PORT}")

    yield

    # Cleanup
    if not settings.MONGODB_URI:
        await close_db()
    print("Database connections closed")


app = FastAPI(
    title="CallPilot API",
    description="AI-Powered Call Assistant & Smart Reminder Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(contacts.router, prefix="/api/v1")
app.include_router(calls.router, prefix="/api/v1")
app.include_router(notes.router, prefix="/api/v1")
app.include_router(reminders.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(shared.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "app": "CallPilot API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_provider": settings.DEFAULT_AI_PROVIDER,
    }
