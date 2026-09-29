"""
routers/notifications.py — работа с уведомлениями о событиях.

GET   /api/notifications         — список уведомлений текущего пользователя
PATCH /api/notifications/{id}/read — отметить уведомление как прочитанное
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db import get_session
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=List[schemas.NotificationOut])
def get_notifications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Возвращает все уведомления пользователя (новые первыми)."""
    return (
        db.query(models.Notification)
        .filter(models.Notification.user_id == current_user.id)
        .order_by(models.Notification.send_at.desc())
        .all()
    )


@router.patch("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_as_read(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Отмечает уведомление как прочитанное."""
    notification = (
        db.query(models.Notification)
        .filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == current_user.id,
        )
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Уведомление не найдено")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
