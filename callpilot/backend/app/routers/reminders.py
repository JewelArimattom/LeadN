"""Reminders router - CRUD with smart notification support."""

from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.extras import Reminder, ReminderStatus
from app.models.user import User
from app.schemas.extras import (
    ReminderCreate, ReminderUpdate, ReminderResponse, ReminderListResponse,
)

router = APIRouter(prefix="/reminders", tags=["Reminders"])


@router.get("", response_model=ReminderListResponse)
async def list_reminders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    contact_id: UUID | None = None,
    upcoming: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List reminders with filters."""
    query = select(Reminder).where(Reminder.user_id == current_user.id)

    now = datetime.now(timezone.utc)

    if status_filter:
        query = query.where(Reminder.status == status_filter)

    if contact_id:
        query = query.where(Reminder.contact_id == contact_id)

    if upcoming:
        query = query.where(
            and_(
                Reminder.scheduled_at >= now,
                Reminder.status.in_([ReminderStatus.PENDING, ReminderStatus.SNOOZED]),
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(Reminder.scheduled_at.asc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    reminders = result.scalars().all()

    return ReminderListResponse(
        reminders=[ReminderResponse.model_validate(r) for r in reminders],
        total=total, page=page, page_size=page_size,
    )


@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    data: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new reminder."""
    reminder = Reminder(user_id=current_user.id, **data.model_dump())
    db.add(reminder)
    await db.flush()
    await db.refresh(reminder)
    return reminder


@router.get("/{reminder_id}", response_model=ReminderResponse)
async def get_reminder(
    reminder_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single reminder."""
    result = await db.execute(
        select(Reminder).where(
            Reminder.id == reminder_id, Reminder.user_id == current_user.id
        )
    )
    reminder = result.scalar_one_or_none()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder


@router.put("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: UUID,
    data: ReminderUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a reminder (including snooze and completion)."""
    result = await db.execute(
        select(Reminder).where(
            Reminder.id == reminder_id, Reminder.user_id == current_user.id
        )
    )
    reminder = result.scalar_one_or_none()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    update_data = data.model_dump(exclude_unset=True)

    # Handle completion
    if update_data.get("status") == "completed":
        update_data["completed_at"] = datetime.now(timezone.utc)

    for key, value in update_data.items():
        setattr(reminder, key, value)

    await db.flush()
    await db.refresh(reminder)
    return reminder


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    reminder_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a reminder."""
    result = await db.execute(
        select(Reminder).where(
            Reminder.id == reminder_id, Reminder.user_id == current_user.id
        )
    )
    reminder = result.scalar_one_or_none()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    await db.delete(reminder)
