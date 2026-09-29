import os
from typing import List
from openai import AsyncOpenAI

# Подключаемся к локальному Ollama (который работает на вашем ПК)
# Используем host.docker.internal, так как наш backend запущен внутри Docker
client = AsyncOpenAI(
    base_url="http://host.docker.internal:11434/v1",
    api_key="ollama"  # Ollama не требует реального ключа
)

# Вы можете изменить название модели на то, которое скачаете (например, qwen2.5:1.5b или llama3.2)
LOCAL_MODEL_NAME = "qwen2.5:1.5b"

async def get_ai_productivity_analysis(events: List[dict], notes: List[dict], user_name: str) -> str:
    """
    Отправляет данные пользователя в локальную нейросеть (Ollama) и получает текстовый анализ продуктивности.
    """
    # Формируем контекст из событий
    events_text = "\n".join([
        f"- {e['date']} {e['start_time'] or ''}: {e['title']} ({e['type']})"
        for e in events
    ]) if events else "Событий нет."

    # Формируем контекст из заметок
    notes_text = "\n".join([
        f"- {n['title']}: {n['text']}"
        for n in notes
    ]) if notes else "Заметок нет."

    prompt = f"""
Ты — персональный AI-ассистент в приложении "Умный Календарь". 
Твоя задача: проанализировать данные пользователя {user_name} за неделю и дать краткий, но полезный отчет о продуктивности.

Вот данные пользователя:
СПИСОК СОБЫТИЙ И ЗАДАЧ:
{events_text}

ТЕКСТЫ ЗАМЕТОК:
{notes_text}

ИНСТРУКЦИЯ ДЛЯ ТЕБЯ:
1. Проанализируй нагрузку пользователя.
2. Выдели главные темы из его заметок и задач.
3. Дай 2 коротких практических совета.
4. Отвечай на русском языке. Будь краток.
"""

    try:
        response = await client.chat.completions.create(
            model=LOCAL_MODEL_NAME,
            messages=[
                {"role": "system", "content": "Ты консультант по продуктивности. Отвечай только на русском языке."},
                {"role": "user", "content": prompt},
            ],
            stream=False
        )
        return response.choices[0].message.content
    except Exception as e:
        error_msg = str(e)
        if "Connection" in error_msg or "ConnectError" in error_msg:
            return "Упс! Локальная нейросеть недоступна. Убедитесь, что программа Ollama запущена на вашем компьютере."
        return f"Ошибка при обращении к локальной нейросети: {error_msg}"
