"""
models.py — SQLAlchemy ORM-модели для PostgreSQL.

Таблицы:
  - users            : информация о пользователе
  - events           : события/задачи/встречи
  - notes            : заметки
  - event_templates  : шаблоны событий
  - notifications    : уведомления
"""

from datetime import datetime, date, time
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date, Time,
    ForeignKey, Text, func
)
from sqlalchemy.orm import relationship
from db import Base


class User(Base):
    """Пользователь системы."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=True)   # None для OAuth-пользователей
    avatar_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Связи
    events = relationship("Event", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    templates = relationship("EventTemplate", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Event(Base):
    """Событие: встреча, задача или заметка-событие."""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(512), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    type = Column(String(50), nullable=False, default="task")  # 'meeting' | 'task' | 'note'
    link = Column(String(512), nullable=True)
    template_id = Column(Integer, ForeignKey("event_templates.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Связи
    user = relationship("User", back_populates="events")
    template = relationship("EventTemplate")
    notifications = relationship("Notification", back_populates="event", cascade="all, delete-orphan")


class Note(Base):
    """Текстовая заметка пользователя."""
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(512), nullable=False, default="Без названия")
    text = Column(Text, nullable=False)
    date = Column(Date, nullable=True)   # привязка к конкретной дате (необязательно)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Связи
    user = relationship("User", back_populates="notes")


class EventTemplate(Base):
    """Шаблон события для быстрого создания."""
    __tablename__ = "event_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(512), nullable=False)
    type = Column(String(50), nullable=False, default="task")  # 'meeting' | 'task' | 'note'
    default_duration = Column(Integer, nullable=True)   # длительность в минутах
    description = Column(Text, nullable=True)
    link = Column(String(512), nullable=True)

    # Связи
    user = relationship("User", back_populates="templates")


class Notification(Base):
    """Уведомление о предстоящем событии."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    send_at = Column(DateTime, nullable=False)    # когда отправить уведомление
    sent = Column(Boolean, default=False, nullable=False)

    # Связи
    user = relationship("User", back_populates="notifications")
    event = relationship("Event", back_populates="notifications")
