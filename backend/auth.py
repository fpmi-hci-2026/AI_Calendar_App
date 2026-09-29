"""
auth.py — утилиты для JWT-аутентификации.

Функции:
  - hash_password / verify_password : bcrypt-хеширование
  - create_access_token             : генерация access JWT
  - create_refresh_token            : генерация refresh JWT
  - decode_token                    : верификация и декодирование JWT
  - get_current_user                : FastAPI dependency — возвращает текущего пользователя
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from db import get_session
import models

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ─── Хеширование пароля ───────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Возвращает bcrypt-хеш пароля."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Сравнивает открытый пароль с хешем."""
    return pwd_context.verify(plain, hashed)


# ─── Работа с JWT ─────────────────────────────────────────────────────────────

def _create_token(data: dict, expires_delta: timedelta) -> str:
    """Внутренняя функция создания JWT-токена."""
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + expires_delta
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_access_token(user_id: int) -> str:
    """Создаёт короткоживущий access-токен."""
    return _create_token(
        {"sub": str(user_id), "type": "access"},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: int) -> str:
    """Создаёт долгоживущий refresh-токен."""
    return _create_token(
        {"sub": str(user_id), "type": "refresh"},
        timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decode_token(token: str, expected_type: str = "access") -> int:
    """
    Декодирует JWT-токен.

    Возвращает user_id (int) или бросает HTTPException 401.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось подтвердить учётные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        token_type: Optional[str] = payload.get("type")
        if user_id is None or token_type != expected_type:
            raise credentials_exception
        return int(user_id)
    except JWTError:
        raise credentials_exception


# ─── FastAPI Dependency ───────────────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_session),
) -> models.User:
    """
    FastAPI dependency.
    Извлекает текущего пользователя из Bearer-токена.
    """
    user_id = decode_token(token, expected_type="access")
    user = db.get(models.User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )
    return user
