from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from db import get_session
import models
from auth import get_current_user
from services.ai_service import get_ai_productivity_analysis

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.get("/analyze")
async def analyze_user_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """
    Эндпоинт для получения AI-анализа продуктивности пользователя.
    """
    # Берем данные за последние 7 дней
    seven_days_ago = date.today() - timedelta(days=7)
    
    # Загружаем события
    events = db.query(models.Event).filter(
        models.Event.user_id == current_user.id,
        models.Event.date >= seven_days_ago
    ).all()
    
    # Загружаем заметки
    notes = db.query(models.Note).filter(
        models.Note.user_id == current_user.id,
        models.Note.created_at >= seven_days_ago
    ).all()

    # Превращаем в простые словари для сервиса
    events_list = [
        {"title": e.title, "date": str(e.date), "start_time": str(e.start_time) if e.start_time else None, "type": e.type}
        for e in events
    ]
    
    notes_list = [
        {"title": n.title, "text": n.text}
        for n in notes
    ]

    analysis = await get_ai_productivity_analysis(events_list, notes_list, current_user.name)
    
    return {"analysis": analysis}
