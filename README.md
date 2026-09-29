# Умный Календарь — Инструкция по установке и запуску

Веб-приложение для управления событиями, задачами и заметками.  
**Стек:** Next.js 14 + TypeScript (фронтенд) / FastAPI + PostgreSQL (бэкенд).

---

## Содержание

1. [Необходимые программы](#1-необходимые-программы)
2. [Установка PostgreSQL](#2-установка-postgresql)
3. [Настройка бэкенда](#3-настройка-бэкенда)
4. [Запуск бэкенда](#4-запуск-бэкенда)
5. [Настройка фронтенда](#5-настройка-фронтенда)
6. [Запуск фронтенда](#6-запуск-фронтенда)
7. [Открытие приложения](#7-открытие-приложения)
8. [Частые проблемы](#8-частые-проблемы)

---

## 1. Необходимые программы

Установи следующие программы перед началом работы:

| Программа  | Версия         | Откуда скачать                                    |
|------------|----------------|---------------------------------------------------|
| Python     | 3.11 или новее | https://www.python.org/downloads/                 |
| Node.js    | 18 или новее   | https://nodejs.org/ (выбери LTS)                  |
| PostgreSQL | 15 или новее   | https://www.postgresql.org/download/windows/      |
| Git        | любая          | https://git-scm.com/download/win                  |

> **Важно при установке Python:** на первом экране установщика поставь галочку **«Add Python to PATH»**.

> **Важно при установке Node.js:** установщик автоматически добавляет `node` и `npm` в PATH.

Проверь установку — открой **Командную строку** (Win+R → `cmd`) и выполни:

```cmd
python --version
node --version
npm --version
psql --version
```

Каждая команда должна вывести номер версии без ошибок.

---

## 2. Установка PostgreSQL

После установки PostgreSQL нужно создать базу данных и пользователя.

Открой **SQL Shell (psql)** из меню Пуск (устанавливается вместе с PostgreSQL).  
Нажимай Enter на все вопросы (сервер, порт, пользователь) пока не попросит пароль — введи пароль, который задал при установке.

Выполни по очереди следующие команды:

```sql
CREATE USER planner WITH PASSWORD 'planner';
CREATE DATABASE planner_db OWNER planner;
GRANT ALL PRIVILEGES ON DATABASE planner_db TO planner;
\q
```

---

## 3. Настройка бэкенда

Открой **Командную строку** или **PowerShell** и перейди в папку бэкенда:

```cmd
cd путь\до\Kursovoi_Project\backend
```

### 3.1 Создай виртуальное окружение

```cmd
python -m venv venv
```

### 3.2 Активируй виртуальное окружение

**Командная строка (cmd):**
```cmd
venv\Scripts\activate
```

**PowerShell:**
```powershell
venv\Scripts\Activate.ps1
```

> Если PowerShell выдаёт ошибку про политику выполнения, запусти:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> и повтори активацию.

После активации в начале строки появится `(venv)`.

### 3.3 Установи зависимости

```cmd
pip install -r requirements.txt
```

### 3.4 Создай файл конфигурации `.env`

Скопируй `.env.example` в `.env`:

```cmd
copy .env.example .env
```

Открой `.env` в любом текстовом редакторе (Блокнот, VS Code) и убедись, что содержимое такое:

```env
DATABASE_URL=postgresql://planner:planner@localhost:5432/planner_db
SECRET_KEY=измени-это-на-длинный-случайный-ключ
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

> **Замени `SECRET_KEY`** на любую длинную случайную строку, например:  
> `SECRET_KEY=k8f2mXpLqR9vZnT3wYeAcBsD7jHgUiO`

> **Обрати внимание:** в `.env.example` в `DATABASE_URL` написано `@postgres:5432` (для Docker).  
> При локальном запуске замени `postgres` на `localhost`.

### 3.5 Примени миграции базы данных

```cmd
alembic upgrade head
```

Если миграций ещё нет, сначала создай их:

```cmd
alembic revision --autogenerate -m "init"
alembic upgrade head
```

---

## 4. Запуск бэкенда

Убедись, что виртуальное окружение активно (в начале строки есть `(venv)`), затем:

```cmd
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Ты должен увидеть:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

Проверь работу: открой в браузере http://localhost:8000/docs — там должен появиться Swagger UI с документацией API.

> Оставь это окно командной строки открытым. Бэкенд должен работать пока ты используешь приложение.

---

## 5. Настройка фронтенда

Открой **новое** окно Командной строки и перейди в папку фронтенда:

```cmd
cd путь\до\Kursovoi_Project\frontend
```

### 5.1 Установи зависимости

```cmd
npm install
```

Это займёт 1–3 минуты. По завершении появится папка `node_modules`.

### 5.2 Проверь файл `.env.local`

В папке `frontend` должен быть файл `.env.local` со следующим содержимым:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Если файла нет — создай его вручную с этим содержимым.

---

## 6. Запуск фронтенда

```cmd
npm run dev
```

Ты должен увидеть:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

> Оставь это окно тоже открытым.

---

## 7. Открытие приложения

Открой браузер и перейди по адресу:

**http://localhost:3000**

Ты попадёшь на страницу входа. Зарегистрируй новый аккаунт и начни пользоваться приложением.

### Структура приложения

| Раздел              | Адрес        | Описание                          |
|---------------------|--------------|-----------------------------------|
| Вход / Регистрация  | `/auth`      | Авторизация                       |
| Календарь           | `/dashboard` | Просмотр и создание событий       |
| Заметки             | `/notes`     | Личные заметки                    |
| Аналитика           | `/analytics` | Статистика за неделю / месяц      |

---

## 8. Частые проблемы

### `psql` не найден в командной строке

PostgreSQL не добавился в PATH. Добавь путь вручную:  
`C:\Program Files\PostgreSQL\15\bin` (номер версии может отличаться) → Переменные среды → PATH.

### Ошибка `ModuleNotFoundError` при запуске бэкенда

Виртуальное окружение не активировано. Выполни `venv\Scripts\activate` и повтори запуск.

### Ошибка `alembic: command not found`

То же — активируй виртуальное окружение.

### Бэкенд запускается, но возвращает ошибку подключения к БД

Проверь:
1. PostgreSQL запущен (Диспетчер задач / Службы → `postgresql-x64-15` → Работает)
2. В `.env` указан `localhost`, а не `postgres`
3. Пользователь `planner` и база `planner_db` существуют (см. шаг 2)

### Фронтенд показывает ошибку сети / не загружает данные

1. Убедись, что бэкенд запущен на порту 8000
2. Проверь `.env.local` — должно быть `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. Перезапусти `npm run dev` после изменения `.env.local`

### `npm install` падает с ошибкой про Node версию

Обнови Node.js до версии 18 LTS или новее с сайта https://nodejs.org/

### PowerShell не запускает скрипты (политика выполнения)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Быстрый старт (шпаргалка)

После первоначальной настройки для каждого последующего запуска нужно два терминала:

**Терминал 1 — бэкенд:**
```cmd
cd путь\до\Kursovoi_Project\backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

**Терминал 2 — фронтенд:**
```cmd
cd путь\до\Kursovoi_Project\frontend
npm run dev
```

Открой http://localhost:3000
