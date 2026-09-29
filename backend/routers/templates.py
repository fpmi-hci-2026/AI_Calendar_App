"""
routers/templates.py — CRUD шаблонов событий.

GET    /api/templates       — все шаблоны пользователя
POST   /api/templates       — создать шаблон
DELETE /api/templates/{id}  — удалить шаблон
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db import get_session
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=List[schemas.TemplateOut])
def get_templates(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Возвращает все шаблоны текущего пользователя."""
    return (
        db.query(models.EventTemplate)
        .filter(models.EventTemplate.user_id == current_user.id)
        .all()
    )


@router.post("", response_model=schemas.TemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(
    data: schemas.TemplateCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Создаёт новый шаблон события."""
    template = models.EventTemplate(**data.model_dump(), user_id=current_user.id)
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Удаляет шаблон по ID."""
    template = (
        db.query(models.EventTemplate)
        .filter(
            models.EventTemplate.id == template_id,
            models.EventTemplate.user_id == current_user.id,
        )
        .first()
    )
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Шаблон не найден")
    db.delete(template)
    db.commit()
