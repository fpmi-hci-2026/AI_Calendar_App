"""
schemas.py — Pydantic-схемы для валидации запросов и формирования ответов API.
"""

# Импортируем типы под алиасами, чтобы имена полей (date, time) не конфликтовали
# с именами типов в Pydantic v2 при разрешении аннотаций.
import datetime as _dt
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# Удобные псевдонимы
Date     = _dt.date
Time     = _dt.time
DateTime = _dt.datetime


# ─────────────────────────────────────────────
# USER
# ─────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None
    created_at: DateTime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None


# ─────────────────────────────────────────────
# AUTH TOKENS
# ─────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


# ─────────────────────────────────────────────
# EVENT
# ─────────────────────────────────────────────

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: Date
    start_time: Optional[Time] = None
    end_time: Optional[Time] = None
    type: str = "task"
    link: Optional[str] = None
    template_id: Optional[int] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[Date] = None
    start_time: Optional[Time] = None
    end_time: Optional[Time] = None
    type: Optional[str] = None
    link: Optional[str] = None


class EventOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    date: Date
    start_time: Optional[Time] = None
    end_time: Optional[Time] = None
    type: str
    link: Optional[str] = None
    template_id: Optional[int] = None
    created_at: DateTime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# NOTE
# ─────────────────────────────────────────────

class NoteCreate(BaseModel):
    title: str = "Без названия"
    text: str
    note_date: Optional[str] = None   # строка "YYYY-MM-DD", конвертируется в роутере


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    note_date: Optional[str] = None   # строка "YYYY-MM-DD", конвертируется в роутере


class NoteOut(BaseModel):
    id: int
    user_id: int
    title: str
    text: str
    date: Optional[Date] = None
    created_at: DateTime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# EVENT TEMPLATE
# ─────────────────────────────────────────────

class TemplateCreate(BaseModel):
    title: str
    type: str = "task"
    default_duration: Optional[int] = None
    description: Optional[str] = None
    link: Optional[str] = None


class TemplateOut(BaseModel):
    id: int
    user_id: int
    title: str
    type: str
    default_duration: Optional[int] = None
    description: Optional[str] = None
    link: Optional[str] = None

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# NOTIFICATION
# ─────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    user_id: int
    event_id: int
    message: str
    is_read: bool
    send_at: DateTime
    sent: bool

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────
# ANALYTICS
# ─────────────────────────────────────────────

class EventTypeCount(BaseModel):
    type: str
    count: int


class DailyActivity(BaseModel):
    date: Date
    count: int


class AnalyticsOut(BaseModel):
    total_events: int
    by_type: List[EventTypeCount]
    daily_activity: List[DailyActivity]
    total_notes: int
