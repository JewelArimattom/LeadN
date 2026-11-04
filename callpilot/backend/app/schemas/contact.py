"""Contact schemas for request/response validation."""

from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class ContactCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: str | None = None
    email: EmailStr | None = None
    company: str | None = None
    job_title: str | None = None
    location: str | None = None
    source: str | None = None
    status: str = "new"
    priority: str = "medium"
    notes_text: str | None = None


class ContactUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    company: str | None = None
    job_title: str | None = None
    location: str | None = None
    source: str | None = None
    status: str | None = None
    priority: str | None = None
    notes_text: str | None = None


class ContactResponse(BaseModel):
    id: UUID
    full_name: str
    phone: str | None
    email: str | None
    company: str | None
    job_title: str | None
    location: str | None
    source: str | None
    status: str
    priority: str
    notes_text: str | None
    total_calls: int
    last_contacted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ContactListResponse(BaseModel):
    contacts: list[ContactResponse]
    total: int
    page: int
    page_size: int
