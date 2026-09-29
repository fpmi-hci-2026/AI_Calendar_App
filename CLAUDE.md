# Курсовой проект — «Умный Календарь»
**Студент:** Шибитов Николай, Группа 11, Курс 3
**Дисциплина:** Курсовая работа по разработке веб-приложений
**Год:** 2025

---

## Описание проекта

«Умный Календарь» — веб-приложение для управления событиями, задачами и заметками с функциями умного планирования. Основная идея: устранить недостатки существующих инструментов (Google Calendar, Doodle, Tweek), объединив персональный календарь, групповое планирование и аналитику в одном продукте.

---

## Конкуренты и их недостатки

| Продукт | Плюсы | Недостатки |
|---|---|---|
| Google Calendar | Интеграция с Google Workspace, коллаборация | Привязка к экосистеме Google, перегруженный интерфейс |
| Doodle | Групповое согласование времени | Freemium-ограничения, нет полноценного личного календаря |
| Tweek | Простой недельный планировщик | Нет группового планирования, нет синхронизации с внешними календарями |

**Ниша проекта:** объединить личный и групповой календарь + умное планирование + заметки + аналитика без привязки к одной экосистеме.

---

## Функциональные требования

### Основные (MVP)
1. **Управление событиями** — CRUD событий с типами: `meeting`, `task`, `note`
2. **Личный календарь** — просмотр по дням/неделям/месяцам, навигация, карточки событий
3. **Заметки** — независимая система заметок, привязанных к дате или свободных
4. **Авторизация** — регистрация/вход по email; OAuth через Google и Microsoft

### Расширенные
5. **Умное планирование** — предложение свободных временных слотов на основе занятости пользователя
6. **Групповое планирование** — создание опросов на совместное время, голосование участников
7. **Шаблоны событий** — сохранение и повторное использование типовых событий (встреча, лекция, дедлайн)
8. **Уведомления** — email и push-уведомления за N минут до события
9. **Аналитика** — статистика занятости по периодам, типам событий, категориям
10. **Интеграция** — импорт/экспорт iCal; OAuth-синхронизация с Google Calendar / Microsoft Outlook

---

## Технический стек

### Frontend
- **React 18** — компонентная архитектура (хуки, контекст, lazy-loading)
- **Next.js 14** — SSR/SSG, маршрутизация, App Router
- **TypeScript** — строгая типизация всех компонентов и API-схем
- **Tailwind CSS** — utility-first стилизация, адаптивный дизайн

### Backend
- **Python 3.11+** — основной язык бэкенда
- **FastAPI** — REST API, автогенерация OpenAPI/Swagger, Pydantic-валидация
- **SQLAlchemy 2.0** — ORM, работа с моделями через Python
- **Alembic** — миграции базы данных
- **Pydantic v2** — схемы запросов/ответов, валидация данных

### База данных
- **PostgreSQL 15+** — основная СУБД

### Аутентификация
- Email/password (JWT-токены)
- OAuth 2.0: Google, Microsoft

### Дополнительно
- **Docker / Docker Compose** — контейнеризация для запуска локально и в продакшене
- **iCal (RFC 5545)** — формат для импорта/экспорта

---

## Архитектура

```
┌─────────────────────────────────────┐
│           Frontend (Next.js)        │
│  React компоненты + TypeScript      │
│  Tailwind CSS                       │
└──────────────┬──────────────────────┘
               │ HTTP / REST API (JSON)
               ▼
┌─────────────────────────────────────┐
│           Backend (FastAPI)         │
│  Роуты → Сервисы → Репозитории      │
│  Pydantic схемы + SQLAlchemy ORM    │
└──────────────┬──────────────────────┘
               │ SQL
               ▼
┌─────────────────────────────────────┐
│          PostgreSQL                 │
│  users, events, notes, templates,   │
│  group_polls, notifications         │
└─────────────────────────────────────┘
```

**Принципы:**
- Клиент-серверная архитектура, полное разделение фронта и бэка
- Stateless REST API — каждый запрос самодостаточен
- Один API обслуживает и веб-клиент, и потенциальное мобильное приложение

---

## REST API (ключевые эндпоинты)

```
# Авторизация
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/oauth/google
POST   /api/auth/oauth/microsoft
POST   /api/auth/refresh

# События
GET    /api/events?from_date=&to_date=&user_id=
POST   /api/events
GET    /api/events/{id}
PUT    /api/events/{id}
DELETE /api/events/{id}

# Заметки
GET    /api/notes?user_id=&date=
POST   /api/notes
PUT    /api/notes/{id}
DELETE /api/notes/{id}

# Шаблоны
GET    /api/templates
POST   /api/templates
DELETE /api/templates/{id}

# Групповое планирование
POST   /api/polls
GET    /api/polls/{id}
POST   /api/polls/{id}/vote

# Аналитика
GET    /api/analytics?user_id=&from=&to=

# Уведомления
GET    /api/notifications
PATCH  /api/notifications/{id}/read
```

---

## Модели данных

### TypeScript (Frontend)

```typescript
export interface Event {
  id: number;
  userId: number;
  title: string;
  description?: string;
  date: string;           // "YYYY-MM-DD"
  startTime?: string;     // "HH:MM"
  endTime?: string;       // "HH:MM"
  type: 'meeting' | 'task' | 'note';
  link?: string;
}

export interface Note {
  id: number;
  userId: number;
  text: string;
  date?: string;          // "YYYY-MM-DD", необязательна
  createdAt: string;      // ISO datetime
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface EventTemplate {
  id: number;
  userId: number;
  title: string;
  type: 'meeting' | 'task' | 'note';
  defaultDuration?: number; // минуты
  description?: string;
  link?: string;
}
```

### Python/SQLAlchemy (Backend)

```python
class User(Base):
    __tablename__ = "users"
    id: int (PK)
    email: str (unique)
    name: str
    password_hash: str | None   # None для OAuth-пользователей
    avatar_url: str | None
    created_at: datetime

class Event(Base):
    __tablename__ = "events"
    id: int (PK)
    user_id: int (FK → users)
    title: str
    description: str | None
    date: date
    start_time: time | None
    end_time: time | None
    type: str  # 'meeting' | 'task' | 'note'
    link: str | None
    template_id: int | None (FK → event_templates)
    created_at: datetime

class Note(Base):
    __tablename__ = "notes"
    id: int (PK)
    user_id: int (FK → users)
    text: str
    date: date | None
    created_at: datetime

class EventTemplate(Base):
    __tablename__ = "event_templates"
    id: int (PK)
    user_id: int (FK → users)
    title: str
    type: str
    default_duration: int | None
    description: str | None
    link: str | None

class Notification(Base):
    __tablename__ = "notifications"
    id: int (PK)
    user_id: int (FK → users)
    event_id: int (FK → events)
    message: str
    is_read: bool
    send_at: datetime
    sent: bool
```

---

## Структура проекта

```
Kursovoi_Project/
├── CLAUDE.md               # этот файл
├── frontend/               # Next.js приложение
│   ├── src/
│   │   ├── app/            # Next.js App Router (страницы)
│   │   │   ├── page.tsx             # главная / редирект
│   │   │   ├── dashboard/page.tsx   # основной календарь
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   └── analytics/page.tsx
│   │   ├── components/
│   │   │   ├── Calendar/       # компонент сетки календаря
│   │   │   ├── EventCard/      # карточка события
│   │   │   ├── EventForm/      # форма создания/редактирования
│   │   │   ├── NotesList/      # список заметок
│   │   │   └── Header/         # шапка с навигацией
│   │   ├── types/
│   │   │   └── index.ts        # все TypeScript интерфейсы
│   │   ├── api/
│   │   │   └── client.ts       # HTTP-клиент (fetch wrapper)
│   │   └── hooks/
│   │       ├── useEvents.ts
│   │       └── useNotes.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                # FastAPI приложение
│   ├── main.py             # точка входа, регистрация роутеров
│   ├── db.py               # подключение к PostgreSQL, get_session
│   ├── models.py           # SQLAlchemy модели
│   ├── schemas.py          # Pydantic схемы
│   ├── routers/
│   │   ├── auth.py
│   │   ├── events.py
│   │   ├── notes.py
│   │   ├── templates.py
│   │   ├── analytics.py
│   │   └── notifications.py
│   ├── services/
│   │   ├── smart_scheduler.py  # умное планирование
│   │   └── notifier.py         # отправка уведомлений
│   ├── alembic/            # миграции
│   │   └── versions/
│   ├── requirements.txt
│   └── .env.example
│
└── docker-compose.yml      # PostgreSQL + backend + frontend
```

---

## UI экраны

1. **Экран авторизации** — форма входа/регистрации, кнопки OAuth (Google, Microsoft)
2. **Dashboard (главный экран)** — сетка календаря слева, список событий на выбранный день справа, кнопка «+ Создать событие»
3. **Форма события** — модальное окно: название, тип, дата, время начала/конца, описание, ссылка, выбор шаблона
4. **Экран заметок** — список заметок с фильтром по дате
5. **Аналитика** — графики занятости по типам событий за период
6. **Настройки** — профиль, подключённые OAuth-аккаунты, настройки уведомлений

---

## Цветовая схема (из курсовой)

- Основной цвет: **emerald-500** (`#10b981`)
- Фон страницы: **slate-50** (`#f8fafc`)
- Карточки: **white** с `shadow-sm`
- Второстепенный текст: **slate-500** (`#64748b`)
- Скругление: `rounded-xl` / `rounded-2xl`

---

## Ключевые реализованные фрагменты из курсовой

### Dashboard компонент (React/Next.js)
```tsx
import { useState } from 'react';
import type { Event } from '@/types';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);

  const todayEvents = events.filter(e =>
    e.date === selectedDate.toISOString().slice(0, 10)
  );
  // ... рендер: header + сетка календаря + aside со списком событий дня
}
```

### FastAPI эндпоинт событий
```python
@app.get("/api/events", response_model=List[EventSchema])
def get_events(from_date: date, to_date: date, user_id: int,
               db: Session = Depends(get_session)):
    return (
        db.query(EventModel)
        .filter(
            EventModel.user_id == user_id,
            EventModel.date >= from_date,
            EventModel.date <= to_date,
        )
        .order_by(EventModel.date, EventModel.start_time)
        .all()
    )
```

---

## Согласованные решения (обсуждение 2025-04-06)

| Аспект | Решение |
|---|---|
| Тип проекта | Полноценное рабочее приложение |
| Авторизация | Email/password + JWT (без внешнего OAuth) |
| Заметки | Отдельный раздел, не тип события |
| Вид календаря | Month + Week, переключатель по умолчанию |
| Аналитика | Статистика за неделю/месяц (общие цифры по типам) |
| Уведомления | Только внутри приложения (колокольчик в шапке) |
| Запуск | Уточняется у преподавателя (предположительно Docker Compose) |

---

## Порядок реализации

1. **Backend — базовая инфраструктура**
   - Настройка FastAPI, подключение PostgreSQL, SQLAlchemy models, Alembic миграции
   - CRUD для Event, Note, EventTemplate
   - JWT-авторизация (email/password)

2. **Frontend — базовые экраны**
   - Настройка Next.js + TypeScript + Tailwind
   - Экраны: Login, Register, Dashboard
   - Компонент календарной сетки
   - Форма создания/редактирования события

3. **Расширенные функции**
   - OAuth (Google, Microsoft)
   - Умное планирование (алгоритм поиска свободных слотов)
   - Шаблоны событий
   - Заметки

4. **Дополнительные функции**
   - Уведомления (email)
   - Аналитика
   - iCal импорт/экспорт
   - Групповое планирование

5. **Docker Compose** — сборка всего проекта в контейнеры

---

## История разработки и изменений (Changelog)

### Фаза 1: Проектирование и Backend
- **База Данных**: Создана схема в PostgreSQL (`users`, `events`, `notes`, `event_templates`, `notifications`). Настроены миграции Alembic.
- **REST API (FastAPI)**: Реализованы эндпоинты для аутентификации (JWT), управления событиями и заметками.
- **Docker**: Подготовлены `Dockerfile` и `docker-compose.yml` для поднятия бэкенда и БД одной командой.

### Фаза 2: Frontend и Клиент-серверное взаимодействие
- **Разработка UI**: Развернут проект на Next.js с Tailwind CSS. Созданы страницы входа/регистрации, главный дашборд с календарем и страница аналитики.
- **Настройка сети (LAN)**: Изменены настройки CORS в `main.py` (`allow_origins=["*"]`) и настроен `NEXT_PUBLIC_API_URL` в `.env.local` для того, чтобы к сайту можно было подключаться с мобильного телефона через локальную Wi-Fi сеть.
- **Адаптивный дизайн**: Реализован Mobile-First интерфейс. Создан компонент `MobileNavigation.tsx` (нижнее меню для смартфонов), добавлены отступы и блокировка масштабирования экрана.

### Фаза 3: Интеграция Нейросети (AI)
- **Умный аналитик**: Добавлен модуль ИИ для анализа продуктивности пользователя на основе его задач и заметок.
- **Технология**: Изначально планировалось API DeepSeek, но в итоге **сделан выбор в пользу локальных моделей через Ollama** (модель `qwen2.5:1.5b` или `llama3.2`).
- **Бэкенд**: В `requirements.txt` добавлена библиотека `openai`. Написан сервис `ai_service.py`, который связывается с локальным процессом Ollama по адресу `host.docker.internal:11434`.
- **Фронтенд**: Разработан градиентный `AIWidget.tsx` с анимацией загрузки, встроенный на страницу Аналитики. Отчеты от нейросети появляются прямо в интерфейсе пользователя без необходимости доступа к платному интернету.
