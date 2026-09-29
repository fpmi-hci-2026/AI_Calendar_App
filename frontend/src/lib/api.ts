/**
 * api.ts — HTTP-клиент для работы с бэкендом.
 *
 * - Автоматически добавляет Bearer-токен из localStorage
 * - При 401 пытается обновить токен через refresh
 * - Маппер snake_case → camelCase для типов фронтенда
 */

import type { CalendarEvent, Note, Notification } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Хранение токенов ──────────────────────────────────────────────────────────

export const tokens = {
  getAccess:   () => (typeof window !== 'undefined' ? localStorage.getItem('access_token')  : null),
  getRefresh:  () => (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null),
  set: (access: string, refresh: string) => {
    localStorage.setItem('access_token',  access);
    localStorage.setItem('refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// ── Базовый fetch ─────────────────────────────────────────────────────────────

async function tryRefresh(): Promise<boolean> {
  const refresh = tokens.getRefresh();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokens.set(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const access = tokens.getAccess();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, false);
    tokens.clear();
    window.location.href = '/auth';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Ошибка сервера' }));
    const detail = body.detail;
    let message: string;
    if (typeof detail === 'string') {
      message = detail;
    } else if (Array.isArray(detail)) {
      // FastAPI validation error: [{loc, msg, type}, ...]
      message = detail.map((d: { msg?: string; loc?: string[] }) =>
        `${d.loc?.slice(1).join('.') ?? ''}: ${d.msg ?? ''}`
      ).join(' | ');
    } else {
      message = `Ошибка ${res.status}`;
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Маппер: ответ бэкенда → тип фронтенда ────────────────────────────────────

function mapEvent(e: Record<string, unknown>): CalendarEvent {
  const trimTime = (t: string | null | undefined) => t ? t.slice(0, 5) : undefined;
  return {
    id:          e.id          as number,
    userId:      e.user_id     as number,
    title:       e.title       as string,
    description: e.description as string | undefined,
    date:        e.date        as string,
    startTime:   trimTime(e.start_time as string),
    endTime:     trimTime(e.end_time   as string),
    type:        e.type        as CalendarEvent['type'],
    link:        e.link        as string | undefined,
  };
}

function mapNote(n: Record<string, unknown>): Note {
  return {
    id:        n.id         as number,
    userId:    n.user_id    as number,
    title:     (n.title as string) ?? 'Без названия',
    text:      n.text       as string,
    date:      n.date       as string | undefined,
    createdAt: n.created_at as string,
  };
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

export interface AuthResult {
  access_token: string;
  refresh_token: string;
}

export async function apiRegister(email: string, name: string, password: string): Promise<AuthResult> {
  return request<AuthResult>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  });
}

export async function apiLogin(email: string, password: string): Promise<AuthResult> {
  return request<AuthResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
}

export async function apiGetMe(): Promise<UserProfile> {
  return request<UserProfile>('/api/auth/me');
}

// ── EVENTS ────────────────────────────────────────────────────────────────────

export async function apiFetchEvents(fromDate?: string, toDate?: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams();
  if (fromDate) params.set('from_date', fromDate);
  if (toDate)   params.set('to_date',   toDate);
  const qs = params.toString();
  const raw = await request<Record<string, unknown>[]>(`/api/events${qs ? `?${qs}` : ''}`);
  return raw.map(mapEvent);
}

export async function apiCreateEvent(data: Omit<CalendarEvent, 'id' | 'userId'>): Promise<CalendarEvent> {
  const body = {
    title:       data.title,
    description: data.description,
    date:        data.date,
    start_time:  data.startTime ?? null,
    end_time:    data.endTime   ?? null,
    type:        data.type,
    link:        data.link ?? null,
  };
  const raw = await request<Record<string, unknown>>('/api/events', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return mapEvent(raw);
}

export async function apiUpdateEvent(id: number, data: Partial<Omit<CalendarEvent, 'id' | 'userId'>>): Promise<CalendarEvent> {
  const body: Record<string, unknown> = {};
  if (data.title       !== undefined) body.title       = data.title;
  if (data.description !== undefined) body.description = data.description;
  if (data.date        !== undefined) body.date        = data.date;
  if (data.startTime   !== undefined) body.start_time  = data.startTime;
  if (data.endTime     !== undefined) body.end_time    = data.endTime;
  if (data.type        !== undefined) body.type        = data.type;
  if (data.link        !== undefined) body.link        = data.link;
  const raw = await request<Record<string, unknown>>(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapEvent(raw);
}

export async function apiDeleteEvent(id: number): Promise<void> {
  return request<void>(`/api/events/${id}`, { method: 'DELETE' });
}

// ── NOTES ─────────────────────────────────────────────────────────────────────

export async function apiFetchNotes(date?: string): Promise<Note[]> {
  const qs = date ? `?date=${date}` : '';
  const raw = await request<Record<string, unknown>[]>(`/api/notes${qs}`);
  return raw.map(mapNote);
}

export async function apiCreateNote(data: { title: string; text: string; date?: string }): Promise<Note> {
  const body = { title: data.title, text: data.text, note_date: data.date ?? null };
  const raw = await request<Record<string, unknown>>('/api/notes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return mapNote(raw);
}

export async function apiUpdateNote(id: number, data: { title?: string; text?: string; date?: string }): Promise<Note> {
  const body: Record<string, unknown> = {};
  if (data.title !== undefined) body.title     = data.title;
  if (data.text  !== undefined) body.text      = data.text;
  if (data.date  !== undefined) body.note_date = data.date ?? null;
  const raw = await request<Record<string, unknown>>(`/api/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapNote(raw);
}

export async function apiDeleteNote(id: number): Promise<void> {
  return request<void>(`/api/notes/${id}`, { method: 'DELETE' });
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  total_events: number;
  by_type: { type: string; count: number }[];
  daily_activity: { date: string; count: number }[];
  total_notes: number;
}

export async function apiFetchAnalytics(from?: string, to?: string): Promise<AnalyticsData> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to)   params.set('to',   to);
  const qs = params.toString();
  return request<AnalyticsData>(`/api/analytics${qs ? `?${qs}` : ''}`);
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

export async function apiFetchNotifications(): Promise<Notification[]> {
  const raw = await request<Record<string, unknown>[]>('/api/notifications');
  return raw.map(n => ({
    id:        n.id         as number,
    userId:    n.user_id    as number,
    eventId:   n.event_id   as number | undefined,
    message:   n.message    as string,
    isRead:    n.is_read    as boolean,
    createdAt: n.send_at    as string,
  }));
}

export async function apiMarkNotificationRead(id: number): Promise<void> {
  return request<void>(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

// ── AI ────────────────────────────────────────────────────────────────────────

export async function apiFetchAIAnalysis(): Promise<{ analysis: string }> {
  return request<{ analysis: string }>('/api/ai/analyze');
}
