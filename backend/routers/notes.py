"""
routers/notes.py — CRUD-эндпоинты для заметок.

GET    /api/notes           — список заметок пользователя (фильтр по дате)
POST   /api/notes           — создать заметку
PUT    /api/notes/{id}      — обновить заметку
DELETE /api/notes/{id}      — удалить заметку
"""

import datetime as _dt
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from db import get_session
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/notes", tags=["notes"])


def _get_note_or_404(note_id: int, user_id: int, db: Session) -> models.Note:
    note = db.query(models.Note).filter(
        models.Note.id == note_id,
        models.Note.user_id == user_id,
    ).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заметка не найдена")
    return note


@router.get("", response_model=List[schemas.NoteOut])
def get_notes(
    note_date: Optional[_dt.date] = Query(None, alias="date", description="Фильтр по дате (YYYY-MM-DD)"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Возвращает заметки пользователя. При передаче date — только за этот день."""
    query = db.query(models.Note).filter(models.Note.user_id == current_user.id)
    if note_date:
        query = query.filter(models.Note.date == note_date)
    return query.order_by(models.Note.created_at.desc()).all()


def _str_to_date(s: Optional[str]) -> Optional[_dt.date]:
    """Конвертирует строку 'YYYY-MM-DD' в date, либо None."""
    if not s:
        return None
    return _dt.date.fromisoformat(s)


@router.post("", response_model=schemas.NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    data: schemas.NoteCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Создаёт новую заметку."""
    note = models.Note(
        title=data.title,
        text=data.text,
        date=_str_to_date(data.note_date),
        user_id=current_user.id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{note_id}", response_model=schemas.NoteOut)
def update_note(
    note_id: int,
    data: schemas.NoteUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Обновляет текст или дату заметки."""
    note = _get_note_or_404(note_id, current_user.id, db)
    if data.title is not None:
        note.title = data.title
    if data.text is not None:
        note.text = data.text
    if data.note_date is not None:
        note.date = _str_to_date(data.note_date)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Удаляет заметку."""
    note = _get_note_or_404(note_id, current_user.id, db)
    db.delete(note)
    db.commit()
