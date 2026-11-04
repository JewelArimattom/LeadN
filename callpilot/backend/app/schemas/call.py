"""Call record schemas."""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class CallRecordCreate(BaseModel):
    contact_id: UUID | None = None
    phone_number: str | None = None
    call_type: str = "manual"
    started_at: datetime
    ended_at: datetime | None = None
    duration_seconds: int = 0
    has_recording: bool = False
    notes_text: str | None = None
    follow_up_date: datetime | None = None


class CallRecordUpdate(BaseModel):
    contact_id: UUID | None = None
    phone_number: str | None = None
    call_type: str | None = None
    ended_at: datetime | None = None
    duration_seconds: int | None = None
    notes_text: str | None = None
    follow_up_status: str | None = None
    follow_up_date: datetime | None = None


class CallRecordResponse(BaseModel):
    id: UUID
    user_id: UUID
    contact_id: UUID | None
    phone_number: str | None
    call_type: str
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int
    has_recording: bool
    transcription_status: str
    follow_up_status: str
    follow_up_date: datetime | None
    notes_text: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CallListResponse(BaseModel):
    calls: list[CallRecordResponse]
    total: int
    page: int
    page_size: int


class RecordingUploadResponse(BaseModel):
    id: UUID
    call_record_id: UUID
    file_name: str
    file_size_bytes: int
    duration_seconds: int
    mime_type: str
    created_at: datetime

    model_config = {"from_attributes": True}
