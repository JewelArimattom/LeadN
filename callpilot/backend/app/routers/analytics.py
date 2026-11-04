"""Analytics router - dashboard, call stats, and conversion metrics."""

from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, and_, case, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.call import CallRecord
from app.models.contact import Contact, ContactStatus
from app.models.extras import Reminder, ReminderStatus
from app.models.user import User
from app.schemas.extras import DashboardAnalytics, CallAnalytics, ConversionAnalytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardAnalytics)
async def dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard analytics overview."""
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_week = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)

    uid = current_user.id

    # Total calls
    total_calls = (await db.execute(
        select(func.count()).select_from(CallRecord).where(CallRecord.user_id == uid)
    )).scalar() or 0

    # Calls today
    calls_today = (await db.execute(
        select(func.count()).select_from(CallRecord).where(
            CallRecord.user_id == uid, CallRecord.started_at >= start_of_day
        )
    )).scalar() or 0

    # Recorded conversations
    recorded = (await db.execute(
        select(func.count()).select_from(CallRecord).where(
            CallRecord.user_id == uid, CallRecord.has_recording == True
        )
    )).scalar() or 0

    # Follow-ups
    pending_followups = (await db.execute(
        select(func.count()).select_from(CallRecord).where(
            CallRecord.user_id == uid, CallRecord.follow_up_status == "scheduled"
        )
    )).scalar() or 0

    completed_followups = (await db.execute(
        select(func.count()).select_from(CallRecord).where(
            CallRecord.user_id == uid, CallRecord.follow_up_status == "completed"
        )
    )).scalar() or 0

    # Reminders
    upcoming_reminders = (await db.execute(
        select(func.count()).select_from(Reminder).where(
            Reminder.user_id == uid,
            Reminder.status == ReminderStatus.PENDING,
            Reminder.scheduled_at >= now,
        )
    )).scalar() or 0

    overdue_reminders = (await db.execute(
        select(func.count()).select_from(Reminder).where(
            Reminder.user_id == uid,
            Reminder.status == ReminderStatus.PENDING,
            Reminder.scheduled_at < now,
        )
    )).scalar() or 0

    # New contacts this week
    new_contacts = (await db.execute(
        select(func.count()).select_from(Contact).where(
            Contact.user_id == uid, Contact.created_at >= start_of_week
        )
    )).scalar() or 0

    # Total conversation minutes
    total_minutes = (await db.execute(
        select(func.sum(CallRecord.duration_seconds)).where(CallRecord.user_id == uid)
    )).scalar() or 0
    total_minutes = total_minutes // 60

    # Conversion rate
    total_contacts = (await db.execute(
        select(func.count()).select_from(Contact).where(Contact.user_id == uid)
    )).scalar() or 0

    converted = (await db.execute(
        select(func.count()).select_from(Contact).where(
            Contact.user_id == uid, Contact.status == ContactStatus.CONVERTED
        )
    )).scalar() or 0

    conversion_rate = (converted / total_contacts * 100) if total_contacts > 0 else 0.0

    return DashboardAnalytics(
        total_calls=total_calls,
        total_calls_today=calls_today,
        recorded_conversations=recorded,
        pending_follow_ups=pending_followups,
        completed_follow_ups=completed_followups,
        upcoming_reminders=upcoming_reminders,
        overdue_reminders=overdue_reminders,
        new_contacts_this_week=new_contacts,
        total_conversation_minutes=total_minutes,
        conversion_rate=round(conversion_rate, 1),
    )


@router.get("/calls", response_model=CallAnalytics)
async def call_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed call analytics."""
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=days)
    uid = current_user.id

    base_filter = and_(CallRecord.user_id == uid, CallRecord.started_at >= start_date)

    total = (await db.execute(
        select(func.count()).select_from(CallRecord).where(base_filter)
    )).scalar() or 0

    # Calls by type
    type_result = await db.execute(
        select(CallRecord.call_type, func.count())
        .where(base_filter)
        .group_by(CallRecord.call_type)
    )
    calls_by_type = {str(row[0].value if hasattr(row[0], 'value') else row[0]): row[1] for row in type_result.all()}

    # Average duration
    avg_duration = (await db.execute(
        select(func.avg(CallRecord.duration_seconds)).where(base_filter)
    )).scalar() or 0.0

    total_duration = (await db.execute(
        select(func.sum(CallRecord.duration_seconds)).where(base_filter)
    )).scalar() or 0

    # Calls by day (last 7 days)
    calls_by_day = []
    for i in range(min(days, 7)):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = (await db.execute(
            select(func.count()).select_from(CallRecord).where(
                CallRecord.user_id == uid,
                CallRecord.started_at >= day_start,
                CallRecord.started_at < day_end,
            )
        )).scalar() or 0
        calls_by_day.append({"date": day_start.isoformat(), "count": count})

    return CallAnalytics(
        total_calls=total,
        calls_by_type=calls_by_type,
        calls_by_day=list(reversed(calls_by_day)),
        average_duration_seconds=round(float(avg_duration), 1),
        total_duration_minutes=total_duration // 60,
    )


@router.get("/conversions", response_model=ConversionAnalytics)
async def conversion_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get contact conversion analytics."""
    uid = current_user.id

    total = (await db.execute(
        select(func.count()).select_from(Contact).where(Contact.user_id == uid)
    )).scalar() or 0

    # Contacts by status
    status_result = await db.execute(
        select(Contact.status, func.count())
        .where(Contact.user_id == uid)
        .group_by(Contact.status)
    )
    contacts_by_status = {
        str(row[0].value if hasattr(row[0], 'value') else row[0]): row[1]
        for row in status_result.all()
    }

    converted = contacts_by_status.get("converted", 0)
    conversion_rate = (converted / total * 100) if total > 0 else 0.0

    # Most active contacts
    active_result = await db.execute(
        select(Contact)
        .where(Contact.user_id == uid)
        .order_by(Contact.total_calls.desc())
        .limit(10)
    )
    most_active = [
        {
            "name": c.full_name,
            "company": c.company,
            "total_calls": c.total_calls,
            "status": c.status.value if hasattr(c.status, 'value') else c.status,
        }
        for c in active_result.scalars().all()
    ]

    return ConversionAnalytics(
        total_contacts=total,
        contacts_by_status=contacts_by_status,
        conversion_rate=round(conversion_rate, 1),
        most_active_contacts=most_active,
    )
