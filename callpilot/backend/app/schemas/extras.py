"""Note, Reminder, AI, and Analytics schemas."""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


# --- Note Schemas ---

class NoteCreate(BaseModel):
    contact_id: UUID | None = None
    call_record_id: UUID | None = None
    title: str = Field(..., min_length=1, max_length=255)
    content: str = ""
    content_type: str = "text"
    is_pinned: bool = False
    is_important: bool = False
    tags_json: dict | None = None


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    is_pinned: bool | None = None
    is_important: bool | None = None
    tags_json: dict | None = None


class NoteResponse(BaseModel):
    id: UUID
    user_id: UUID
    contact_id: UUID | None
    call_record_id: UUID | None
    title: str
    content: str
    content_type: str
    is_pinned: bool
    is_important: bool
    tags_json: dict | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NoteListResponse(BaseModel):
    notes: list[NoteResponse]
    total: int
    page: int
    page_size: int


# --- Reminder Schemas ---

class ReminderCreate(BaseModel):
    contact_id: UUID | None = None
    call_record_id: UUID | None = None
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    reminder_type: str = "custom"
    scheduled_at: datetime
    remind_before_minutes: int = 15
    is_recurring: bool = False
    recurrence_rule: str | None = None
    priority: str = "medium"
    context_summary: str | None = None


class ReminderUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    reminder_type: str | None = None
    status: str | None = None
    scheduled_at: datetime | None = None
    remind_before_minutes: int | None = None
    priority: str | None = None
    snoozed_until: datetime | None = None


class ReminderResponse(BaseModel):
    id: UUID
    user_id: UUID
    contact_id: UUID | None
    call_record_id: UUID | None
    title: str
    description: str | None
    reminder_type: str
    status: str
    scheduled_at: datetime
    remind_before_minutes: int
    is_recurring: bool
    recurrence_rule: str | None
    priority: str
    context_summary: str | None
    snoozed_until: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReminderListResponse(BaseModel):
    reminders: list[ReminderResponse]
    total: int
    page: int
    page_size: int


# --- AI Schemas ---

class TranscriptionRequest(BaseModel):
    call_record_id: UUID
    language: str = "en"


class TranscriptionResponse(BaseModel):
    id: UUID
    call_record_id: UUID
    full_text: str
    language: str
    confidence_score: float | None
    status: str
    segments: list[dict] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class SummarizeRequest(BaseModel):
    call_record_id: UUID
    transcript_text: str | None = None


class SummaryResponse(BaseModel):
    id: UUID
    call_record_id: UUID
    summary_text: str
    client_requirements: dict | None
    interest_level: str
    important_details: dict | None
    user_commitments: dict | None
    client_commitments: dict | None
    next_steps: dict | None
    suggested_follow_up_date: datetime | None
    follow_up_message: str | None
    sentiment_score: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_history: list[dict] = []


class ChatResponse(BaseModel):
    reply: str
    sources: list[dict] = []
    suggested_actions: list[dict] = []


class ActionItemsResponse(BaseModel):
    actions: list[dict]
    commitments: list[dict]
    follow_up_suggestion: dict | None


class FollowUpGenerateRequest(BaseModel):
    contact_id: UUID
    call_record_id: UUID | None = None


class FollowUpGenerateResponse(BaseModel):
    message: str
    suggested_date: datetime | None
    context: str


# --- Analytics Schemas ---

class DashboardAnalytics(BaseModel):
    total_calls: int = 0
    total_calls_today: int = 0
    recorded_conversations: int = 0
    pending_follow_ups: int = 0
    completed_follow_ups: int = 0
    upcoming_reminders: int = 0
    overdue_reminders: int = 0
    new_contacts_this_week: int = 0
    total_conversation_minutes: int = 0
    conversion_rate: float = 0.0


class CallAnalytics(BaseModel):
    total_calls: int
    calls_by_type: dict
    calls_by_day: list[dict]
    average_duration_seconds: float
    total_duration_minutes: int


class ConversionAnalytics(BaseModel):
    total_contacts: int
    contacts_by_status: dict
    conversion_rate: float
    most_active_contacts: list[dict]
