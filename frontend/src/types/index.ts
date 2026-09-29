export type EventType = 'meeting' | 'task' | 'note';

export interface CalendarEvent {
  id: number;
  userId: number;
  title: string;
  description?: string;
  date: string;       // "YYYY-MM-DD"
  startTime?: string; // "HH:MM"
  endTime?: string;   // "HH:MM"
  type: EventType;
  link?: string;
}

export interface Note {
  id: number;
  userId: number;
  text: string;
  title: string;
  date?: string;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Notification {
  id: number;
  userId: number;
  eventId?: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type CalendarView = 'month' | 'week';
