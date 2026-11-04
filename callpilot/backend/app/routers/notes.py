"""Notes router - CRUD with filtering and search."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.extras import Note
from app.models.user import User
from app.schemas.extras import NoteCreate, NoteUpdate, NoteResponse, NoteListResponse

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("", response_model=NoteListResponse)
async def list_notes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    contact_id: UUID | None = None,
    pinned_only: bool = False,
    important_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List notes with filters."""
    query = select(Note).where(Note.user_id == current_user.id)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(Note.title.ilike(search_term), Note.content.ilike(search_term))
        )

    if contact_id:
        query = query.where(Note.contact_id == contact_id)
    if pinned_only:
        query = query.where(Note.is_pinned == True)
    if important_only:
        query = query.where(Note.is_important == True)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Pinned notes first, then by date
    query = query.order_by(Note.is_pinned.desc(), Note.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    notes = result.scalars().all()

    return NoteListResponse(
        notes=[NoteResponse.model_validate(n) for n in notes],
        total=total, page=page, page_size=page_size,
    )


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new note."""
    note = Note(user_id=current_user.id, **data.model_dump())
    db.add(note)
    await db.flush()
    await db.refresh(note)
    return note


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single note."""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: UUID,
    data: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a note."""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(note, key, value)

    await db.flush()
    await db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a note."""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(note)
