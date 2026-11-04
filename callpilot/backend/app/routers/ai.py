"""Recording upload and AI endpoints."""

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.call import CallRecord, Recording, Transcript, TranscriptSegment, ConversationSummary
from app.models.user import User
from app.schemas.call import RecordingUploadResponse
from app.schemas.extras import (
    TranscriptionRequest, TranscriptionResponse, SummarizeRequest,
    SummaryResponse, ChatRequest, ChatResponse, ActionItemsResponse,
    FollowUpGenerateRequest, FollowUpGenerateResponse,
)
from app.services.ai_service import get_ai_provider

router = APIRouter(tags=["AI & Recordings"])


# --- Recording Endpoints ---

@router.post("/recordings/upload", response_model=RecordingUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_recording(
    call_record_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload an audio recording for a call record."""
    call_id = uuid.UUID(call_record_id)

    # Verify call belongs to user
    result = await db.execute(
        select(CallRecord).where(
            CallRecord.id == call_id, CallRecord.user_id == current_user.id
        )
    )
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call record not found")

    # Validate file size
    contents = await file.read()
    if len(contents) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="File too large")

    # Save file
    upload_dir = Path(settings.UPLOAD_DIR) / str(current_user.id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_ext = Path(file.filename or "recording.m4a").suffix
    file_name = f"{call_id}{file_ext}"
    file_path = upload_dir / file_name

    with open(file_path, "wb") as f:
        f.write(contents)

    # Create recording record
    recording = Recording(
        call_record_id=call_id,
        file_path=str(file_path),
        file_name=file.filename or file_name,
        file_size_bytes=len(contents),
        mime_type=file.content_type or "audio/mp4",
        consent_confirmed=True,
    )
    db.add(recording)

    call.has_recording = True
    await db.flush()
    await db.refresh(recording)

    return recording


@router.get("/recordings/{recording_id}")
async def get_recording(
    recording_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get recording metadata."""
    result = await db.execute(select(Recording).where(Recording.id == recording_id))
    recording = result.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")

    # Verify ownership through call record
    call_result = await db.execute(
        select(CallRecord).where(
            CallRecord.id == recording.call_record_id,
            CallRecord.user_id == current_user.id,
        )
    )
    if not call_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Access denied")

    return RecordingUploadResponse.model_validate(recording)


@router.delete("/recordings/{recording_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recording(
    recording_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a recording and its file."""
    result = await db.execute(select(Recording).where(Recording.id == recording_id))
    recording = result.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")

    # Verify ownership
    call_result = await db.execute(
        select(CallRecord).where(
            CallRecord.id == recording.call_record_id,
            CallRecord.user_id == current_user.id,
        )
    )
    call = call_result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=403, detail="Access denied")

    # Delete file
    if os.path.exists(recording.file_path):
        os.remove(recording.file_path)

    call.has_recording = False
    await db.delete(recording)


# --- AI Endpoints ---

@router.post("/ai/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    data: TranscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Transcribe a recording using AI."""
    if not current_user.cloud_ai_enabled:
        raise HTTPException(status_code=403, detail="Cloud AI processing is disabled")

    # Get recording
    result = await db.execute(
        select(Recording).join(CallRecord).where(
            CallRecord.id == data.call_record_id,
            CallRecord.user_id == current_user.id,
        )
    )
    recording = result.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")

    # Transcribe
    provider = get_ai_provider(current_user.ai_provider)
    result_data = await provider.transcribe(recording.file_path, data.language)

    if "error" in result_data:
        raise HTTPException(status_code=500, detail=result_data["error"])

    # Save transcript
    transcript = Transcript(
        call_record_id=data.call_record_id,
        full_text=result_data["full_text"],
        language=data.language,
        confidence_score=result_data.get("confidence_score"),
        ai_provider=current_user.ai_provider,
        status="completed",
    )
    db.add(transcript)
    await db.flush()
    await db.refresh(transcript)

    # Save segments
    for seg_data in result_data.get("segments", []):
        segment = TranscriptSegment(
            transcript_id=transcript.id,
            **seg_data,
        )
        db.add(segment)

    # Update call record
    call_update = await db.execute(
        select(CallRecord).where(CallRecord.id == data.call_record_id)
    )
    call = call_update.scalar_one()
    call.transcription_status = "completed"

    await db.flush()
    await db.refresh(transcript)

    return TranscriptionResponse(
        id=transcript.id,
        call_record_id=transcript.call_record_id,
        full_text=transcript.full_text,
        language=transcript.language,
        confidence_score=transcript.confidence_score,
        status=transcript.status.value if hasattr(transcript.status, 'value') else transcript.status,
        segments=result_data.get("segments", []),
        created_at=transcript.created_at,
    )


@router.get("/ai/transcripts/{call_record_id}", response_model=TranscriptionResponse)
async def get_transcript(
    call_record_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get transcript for a call record."""
    result = await db.execute(
        select(Transcript).join(CallRecord).where(
            Transcript.call_record_id == call_record_id,
            CallRecord.user_id == current_user.id,
        )
    )
    transcript = result.scalar_one_or_none()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    # Get segments
    seg_result = await db.execute(
        select(TranscriptSegment)
        .where(TranscriptSegment.transcript_id == transcript.id)
        .order_by(TranscriptSegment.segment_order)
    )
    segments = seg_result.scalars().all()

    return TranscriptionResponse(
        id=transcript.id,
        call_record_id=transcript.call_record_id,
        full_text=transcript.full_text,
        language=transcript.language,
        confidence_score=transcript.confidence_score,
        status=transcript.status.value if hasattr(transcript.status, 'value') else transcript.status,
        segments=[
            {
                "speaker_label": s.speaker_label,
                "text": s.text,
                "start_time_ms": s.start_time_ms,
                "end_time_ms": s.end_time_ms,
                "is_highlight": s.is_highlight,
            }
            for s in segments
        ],
        created_at=transcript.created_at,
    )


@router.post("/ai/summarize", response_model=SummaryResponse)
async def summarize_conversation(
    data: SummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate AI summary for a conversation."""
    if not current_user.cloud_ai_enabled:
        raise HTTPException(status_code=403, detail="Cloud AI processing is disabled")

    # Get transcript text
    transcript_text = data.transcript_text
    if not transcript_text:
        result = await db.execute(
            select(Transcript).join(CallRecord).where(
                Transcript.call_record_id == data.call_record_id,
                CallRecord.user_id == current_user.id,
            )
        )
        transcript = result.scalar_one_or_none()
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        transcript_text = transcript.full_text

    # Generate summary
    provider = get_ai_provider(current_user.ai_provider)
    result_data = await provider.summarize(transcript_text)

    if "error" in result_data:
        raise HTTPException(status_code=500, detail=result_data["error"])

    # Parse follow-up date
    follow_up_date = None
    if result_data.get("suggested_follow_up_date"):
        try:
            from dateutil.parser import parse
            follow_up_date = parse(result_data["suggested_follow_up_date"])
        except (ValueError, TypeError):
            pass

    # Save summary
    summary = ConversationSummary(
        call_record_id=data.call_record_id,
        summary_text=result_data.get("summary_text", ""),
        client_requirements=result_data.get("client_requirements"),
        interest_level=result_data.get("interest_level", "unknown"),
        important_details=result_data.get("important_details"),
        user_commitments=result_data.get("user_commitments"),
        client_commitments=result_data.get("client_commitments"),
        next_steps=result_data.get("next_steps"),
        suggested_follow_up_date=follow_up_date,
        follow_up_message=result_data.get("follow_up_message"),
        sentiment_score=result_data.get("sentiment_score"),
        ai_provider=current_user.ai_provider,
    )
    db.add(summary)
    await db.flush()
    await db.refresh(summary)

    return SummaryResponse.model_validate(summary)


@router.post("/ai/extract-actions", response_model=ActionItemsResponse)
async def extract_actions(
    data: SummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Extract action items from a conversation."""
    if not current_user.cloud_ai_enabled:
        raise HTTPException(status_code=403, detail="Cloud AI processing is disabled")

    transcript_text = data.transcript_text
    if not transcript_text:
        result = await db.execute(
            select(Transcript).join(CallRecord).where(
                Transcript.call_record_id == data.call_record_id,
                CallRecord.user_id == current_user.id,
            )
        )
        transcript = result.scalar_one_or_none()
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        transcript_text = transcript.full_text

    provider = get_ai_provider(current_user.ai_provider)
    result_data = await provider.extract_actions(transcript_text)

    if "error" in result_data:
        raise HTTPException(status_code=500, detail=result_data["error"])

    return ActionItemsResponse(
        actions=result_data.get("actions", []),
        commitments=result_data.get("commitments", []),
        follow_up_suggestion=result_data.get("follow_up_suggestion"),
    )


@router.post("/ai/generate-followup", response_model=FollowUpGenerateResponse)
async def generate_follow_up(
    data: FollowUpGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a contextual follow-up message."""
    if not current_user.cloud_ai_enabled:
        raise HTTPException(status_code=403, detail="Cloud AI processing is disabled")

    from app.models.contact import Contact

    # Get contact
    contact_result = await db.execute(
        select(Contact).where(
            Contact.id == data.contact_id, Contact.user_id == current_user.id
        )
    )
    contact = contact_result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Build context
    context = {
        "contact_name": contact.full_name,
        "company": contact.company,
        "status": contact.status.value if hasattr(contact.status, 'value') else contact.status,
    }

    # Get latest summary if available
    if data.call_record_id:
        summary_result = await db.execute(
            select(ConversationSummary).where(
                ConversationSummary.call_record_id == data.call_record_id
            )
        )
        summary = summary_result.scalar_one_or_none()
        if summary:
            context["last_summary"] = summary.summary_text
            context["commitments"] = summary.user_commitments
            context["requirements"] = summary.client_requirements

    provider = get_ai_provider(current_user.ai_provider)
    result_data = await provider.generate_follow_up(context)

    if "error" in result_data:
        raise HTTPException(status_code=500, detail=result_data["error"])

    follow_up_date = None
    if result_data.get("suggested_date"):
        try:
            from dateutil.parser import parse
            follow_up_date = parse(result_data["suggested_date"])
        except (ValueError, TypeError):
            pass

    return FollowUpGenerateResponse(
        message=result_data.get("message", ""),
        suggested_date=follow_up_date,
        context=result_data.get("context", ""),
    )


@router.post("/ai/chat", response_model=ChatResponse)
async def ai_chat(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """AI assistant chat with context from user's data."""
    from app.models.contact import Contact
    from app.models.extras import Reminder, Task

    # Build context from user's data
    context_parts = []

    # Recent contacts
    contacts_result = await db.execute(
        select(Contact)
        .where(Contact.user_id == current_user.id)
        .order_by(Contact.last_contacted_at.desc().nullslast())
        .limit(20)
    )
    contacts = contacts_result.scalars().all()
    if contacts:
        context_parts.append("Recent contacts:")
        for c in contacts:
            context_parts.append(
                f"- {c.full_name} ({c.company or 'N/A'}), Status: {c.status.value if hasattr(c.status, 'value') else c.status}, "
                f"Last contact: {c.last_contacted_at or 'Never'}, Calls: {c.total_calls}"
            )

    # Recent calls with summaries
    calls_result = await db.execute(
        select(CallRecord)
        .where(CallRecord.user_id == current_user.id)
        .order_by(CallRecord.started_at.desc())
        .limit(10)
    )
    calls = calls_result.scalars().all()
    if calls:
        context_parts.append("\nRecent calls:")
        for call in calls:
            summary_result = await db.execute(
                select(ConversationSummary).where(
                    ConversationSummary.call_record_id == call.id
                )
            )
            summary = summary_result.scalar_one_or_none()
            summary_text = summary.summary_text if summary else "No summary"
            context_parts.append(
                f"- Call on {call.started_at}: {call.duration_seconds}s, "
                f"Follow-up: {call.follow_up_status}, Summary: {summary_text[:200]}"
            )

    # Pending reminders
    from datetime import datetime as dt, timezone as tz
    reminders_result = await db.execute(
        select(Reminder)
        .where(
            Reminder.user_id == current_user.id,
            Reminder.status == "pending",
        )
        .order_by(Reminder.scheduled_at.asc())
        .limit(10)
    )
    reminders = reminders_result.scalars().all()
    if reminders:
        context_parts.append("\nPending reminders:")
        for r in reminders:
            context_parts.append(f"- {r.title}: scheduled {r.scheduled_at}")

    # Pending tasks
    tasks_result = await db.execute(
        select(Task)
        .where(Task.user_id == current_user.id, Task.status == "todo")
        .limit(10)
    )
    tasks = tasks_result.scalars().all()
    if tasks:
        context_parts.append("\nPending tasks:")
        for t in tasks:
            context_parts.append(f"- {t.title} (Priority: {t.priority.value if hasattr(t.priority, 'value') else t.priority})")

    context = "\n".join(context_parts)

    provider = get_ai_provider(current_user.ai_provider)
    reply = await provider.chat(data.message, context)

    return ChatResponse(reply=reply, sources=[], suggested_actions=[])
