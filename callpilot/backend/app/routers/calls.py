"""Calls router - CRUD for call records with filtering."""

from uuid import UUID
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.call import CallRecord
from app.models.user import User
from app.schemas.call import (
    CallRecordCreate, CallRecordUpdate, CallRecordResponse, CallListResponse,
)

router = APIRouter(prefix="/calls", tags=["Calls"])


@router.get("", response_model=CallListResponse)
async def list_calls(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    filter_type: str | None = Query(None, alias="filter"),
    contact_id: UUID | None = None,
    sort_by: str = "started_at",
    sort_order: str = "desc",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List call records with filtering and pagination."""
    query = select(CallRecord).where(CallRecord.user_id == current_user.id)

    now = datetime.now(timezone.utc)

    if filter_type == "today":
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.where(CallRecord.started_at >= start_of_day)
    elif filter_type == "yesterday":
        start_yesterday = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        end_yesterday = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.where(and_(CallRecord.started_at >= start_yesterday, CallRecord.started_at < end_yesterday))
    elif filter_type == "this_week":
        start_week = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.where(CallRecord.started_at >= start_week)
    elif filter_type == "this_month":
        start_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        query = query.where(CallRecord.started_at >= start_month)
    elif filter_type == "recorded":
        query = query.where(CallRecord.has_recording == True)
    elif filter_type == "missed_followups":
        query = query.where(
            and_(
                CallRecord.follow_up_status == "scheduled",
                CallRecord.follow_up_date < now,
            )
        )
    elif filter_type == "no_followup":
        query = query.where(CallRecord.follow_up_status == "none")

    if contact_id:
        query = query.where(CallRecord.contact_id == contact_id)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Sort
    sort_col = getattr(CallRecord, sort_by, CallRecord.started_at)
    if sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    calls = result.scalars().all()

    return CallListResponse(
        calls=[CallRecordResponse.model_validate(c) for c in calls],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=CallRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_call(
    data: CallRecordCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log a new call record."""
    call = CallRecord(user_id=current_user.id, **data.model_dump())

    if data.follow_up_date:
        call.follow_up_status = "scheduled"

    db.add(call)
    await db.flush()
    await db.refresh(call)

    # Update contact's last_contacted_at and total_calls
    if call.contact_id:
        from app.models.contact import Contact
        contact_result = await db.execute(
            select(Contact).where(Contact.id == call.contact_id)
        )
        contact = contact_result.scalar_one_or_none()
        if contact:
            contact.last_contacted_at = call.started_at
            contact.total_calls += 1

    return call


@router.get("/{call_id}", response_model=CallRecordResponse)
async def get_call(
    call_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single call record."""
    result = await db.execute(
        select(CallRecord).where(
            CallRecord.id == call_id, CallRecord.user_id == current_user.id
        )
    )
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call record not found")
    return call


@router.put("/{call_id}", response_model=CallRecordResponse)
async def update_call(
    call_id: UUID,
    data: CallRecordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a call record."""
    result = await db.execute(
        select(CallRecord).where(
            CallRecord.id == call_id, CallRecord.user_id == current_user.id
        )
    )
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call record not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(call, key, value)

    await db.flush()
    await db.refresh(call)
    return call


@router.delete("/{call_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_call(
    call_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a call record and associated data."""
    result = await db.execute(
        select(CallRecord).where(
            CallRecord.id == call_id, CallRecord.user_id == current_user.id
        )
    )
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call record not found")

    await db.delete(call)
