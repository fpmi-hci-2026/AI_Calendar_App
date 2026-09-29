"""
main.py — точка входа FastAPI-приложения.

Подключает все роутеры, настраивает CORS и создаёт таблицы при старте.
Swagger UI доступен на http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import engine, Base
import models  # noqa: F401 — чтобы Base увидел все модели перед create_all

from routers import auth, events, notes, templates, analytics, notifications, ai

# ── Lifespan ───────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Создаёт таблицы при старте, освобождает ресурсы при завершении."""
    Base.metadata.create_all(bind=engine)
    yield

# ── Создание приложения ────────────────────────────────────────────────────────

app = FastAPI(
    title="Smart Planner API",
    description="REST API для курсового проекта «Умный планировщик задач»",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
# Разрешаем запросы с любых источников (включая локальную сеть)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Подключение роутеров ────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(notes.router)
app.include_router(templates.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(ai.router)


# ── Health-check ────────────────────────────────────────────────────────────────

@app.get("/health", tags=["health"])
def health_check():
    """Проверка работоспособности сервера."""
    return {"status": "ok"}
