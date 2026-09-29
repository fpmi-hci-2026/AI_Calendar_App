"""
routers/analytics.py — статистика пользователя.

GET /api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD

Возвращает:
  - total_events     : общее число событий за период
  - by_type          : количество событий по типам (meeting/task/note)
  - daily_activity   : количество событий по дням
  - total_notes      : общее число заметок пользователя
"""

from datetime import date
from typing import List, Optional
from collections import defaultdict

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from db import get_session
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("", response_model=schemas.AnalyticsOut)
def get_analytics(
    from_date: Optional[date] = Query(None, alias="from", description="Начало периода"),
    to_date: Optional[date] = Query(None, alias="to", description="Конец периода"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """
    Возвращает агрегированную статистику пользователя:
    - разбивка событий по типам
    - активность по дням (сколько событий в каждый день периода)
    - total notes count
    """
    # ── фильтрация событий ──────────────────────────────────────────────────
    query = db.query(models.Event).filter(models.Event.user_id == current_user.id)
    if from_date:
        query = query.filter(models.Event.date >= from_date)
    if to_date:
        query = query.filter(models.Event.date <= to_date)
    events: List[models.Event] = query.all()

    # ── статистика по типам ─────────────────────────────────────────────────
    type_counts: dict[str, int] = defaultdict(int)
    daily_counts: dict[date, int] = defaultdict(int)
    for event in events:
        type_counts[event.type] += 1
        daily_counts[event.date] += 1

    by_type = [
        schemas.EventTypeCount(type=t, count=c)
        for t, c in sorted(type_counts.items())
    ]

    daily_activity = [
        schemas.DailyActivity(date=d, count=c)
        for d, c in sorted(daily_counts.items())
    ]

    # ── заметки ────────────────────────────────────────────────────────────
    total_notes = (
        db.query(func.count(models.Note.id))
        .filter(models.Note.user_id == current_user.id)
        .scalar()
    )

    return schemas.AnalyticsOut(
        total_events=len(events),
        by_type=by_type,
        daily_activity=daily_activity,
        total_notes=total_notes or 0,
    )
