"""CallPilot FastAPI Backend - Main application entry point."""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

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


def check_mongodb_connection() -> None:
    """Verify the configured shared MongoDB database is reachable."""
    if not settings.MONGODB_URI:
        raise RuntimeError("MONGODB_URI is required for the shared LeadN/CallPilot deployment")

    client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=8000)
    try:
        client[settings.MONGODB_DATABASE].command("ping")
    finally:
        client.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    if settings.MONGODB_URI:
        check_mongodb_connection()
        print(f"MongoDB connection verified: database={settings.MONGODB_DATABASE}")
    else:
        await init_db()
        print("Legacy SQL database initialized")

    print(f"CallPilot API running on {settings.HOST}:{settings.PORT}")
    yield

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {
        "app": "CallPilot API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
def health():
    """Readiness check: return healthy only after a real MongoDB ping."""
    try:
        check_mongodb_connection()
    except Exception as exc:
        # Do not disclose connection strings or credentials in the response.
        raise HTTPException(status_code=503, detail="MongoDB connection unavailable") from exc

    return {
        "status": "healthy",
        "database": "mongodb",
        "database_name": settings.MONGODB_DATABASE,
        "ai_provider": settings.DEFAULT_AI_PROVIDER,
    }
