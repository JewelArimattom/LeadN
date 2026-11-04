"""Call record, recording, transcript, and conversation summary models."""

import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Boolean, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class CallType(str, enum.Enum):
    INCOMING = "incoming"
    OUTGOING = "outgoing"
    IN_APP = "in_app"
    MANUAL = "manual"


class TranscriptionStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class InterestLevel(str, enum.Enum):
    VERY_INTERESTED = "very_interested"
    INTERESTED = "interested"
    NEUTRAL = "neutral"
    NOT_INTERESTED = "not_interested"
    UNKNOWN = "unknown"


class CallRecord(Base):
    __tablename__ = "call_records"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True, index=True
    )
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    call_type: Mapped[CallType] = mapped_column(Enum(CallType), default=CallType.MANUAL)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    has_recording: Mapped[bool] = mapped_column(Boolean, default=False)
    transcription_status: Mapped[TranscriptionStatus] = mapped_column(
        Enum(TranscriptionStatus), default=TranscriptionStatus.PENDING
    )
    follow_up_status: Mapped[str] = mapped_column(String(50), default="none")  # none, scheduled, completed, overdue
    follow_up_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="call_records")
    contact = relationship("Contact", back_populates="call_records")
    recording = relationship("Recording", back_populates="call_record", uselist=False, cascade="all, delete-orphan")
    transcript = relationship("Transcript", back_populates="call_record", uselist=False, cascade="all, delete-orphan")
    summary = relationship("ConversationSummary", back_populates="call_record", uselist=False, cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="call_record", cascade="all, delete-orphan")


class Recording(Base):
    __tablename__ = "recordings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    call_record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("call_records.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    mime_type: Mapped[str] = mapped_column(String(50), default="audio/mp4")
    sample_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)
    consent_confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    call_record = relationship("CallRecord", back_populates="recording")


class Transcript(Base):
    __tablename__ = "transcripts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    call_record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("call_records.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    full_text: Mapped[str] = mapped_column(Text, nullable=False, default="")
    language: Mapped[str] = mapped_column(String(10), default="en")
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_provider: Mapped[str] = mapped_column(String(20), default="openai")
    status: Mapped[TranscriptionStatus] = mapped_column(
        Enum(TranscriptionStatus, name="transcript_status_enum", create_constraint=False),
        default=TranscriptionStatus.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    call_record = relationship("CallRecord", back_populates="transcript")
    segments = relationship("TranscriptSegment", back_populates="transcript", cascade="all, delete-orphan")


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    transcript_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    speaker_label: Mapped[str] = mapped_column(String(50), default="Speaker")
    text: Mapped[str] = mapped_column(Text, nullable=False)
    start_time_ms: Mapped[int] = mapped_column(Integer, default=0)
    end_time_ms: Mapped[int] = mapped_column(Integer, default=0)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_highlight: Mapped[bool] = mapped_column(Boolean, default=False)
    segment_order: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    transcript = relationship("Transcript", back_populates="segments")


class ConversationSummary(Base):
    __tablename__ = "conversation_summaries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    call_record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("call_records.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    summary_text: Mapped[str] = mapped_column(Text, nullable=False, default="")
    client_requirements: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    interest_level: Mapped[InterestLevel] = mapped_column(
        Enum(InterestLevel), default=InterestLevel.UNKNOWN
    )
    important_details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    user_commitments: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    client_commitments: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    next_steps: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    suggested_follow_up_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    follow_up_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    sentiment_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_provider: Mapped[str] = mapped_column(String(20), default="openai")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    call_record = relationship("CallRecord", back_populates="summary")
