import type { CalendarEvent, Note, User, Notification } from '@/types';

export const mockUser: User = {
  id: 1,
  email: 'shibitov@bsu.by',
  name: 'Николай Шибитов',
};

const today = new Date();
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const mockEvents: CalendarEvent[] = [
  {
    id: 1, userId: 1,
    title: 'Лекция по алгоритмам',
    description: 'Аудитория 301, корпус А',
    date: fmt(today),
    startTime: '09:00', endTime: '10:30',
    type: 'meeting',
  },
  {
    id: 2, userId: 1,
    title: 'Сдать курсовую',
    description: 'Отправить на проверку преподавателю',
    date: fmt(today),
    startTime: '14:00', endTime: '14:30',
    type: 'task',
  },
  {
    id: 3, userId: 1,
    title: 'Встреча с группой',
    description: 'Обсуждение проекта по РИПС',
    date: fmt(today),
    startTime: '16:00', endTime: '17:00',
    type: 'meeting',
  },
  {
    id: 4, userId: 1,
    title: 'Лабораторная по ТиОКРС',
    date: fmt(addDays(today, 1)),
    startTime: '11:00', endTime: '12:30',
    type: 'task',
  },
  {
    id: 5, userId: 1,
    title: 'Консультация у преподавателя',
    description: 'Кафедра ПМ, каб. 215',
    date: fmt(addDays(today, 2)),
    startTime: '13:00', endTime: '13:30',
    type: 'meeting',
  },
  {
    id: 6, userId: 1,
    title: 'Дедлайн: реферат',
    date: fmt(addDays(today, 3)),
    startTime: '23:59',
    type: 'task',
  },
  {
    id: 7, userId: 1,
    title: 'Экзамен по математике',
    description: 'Аудитория 101',
    date: fmt(addDays(today, 7)),
    startTime: '09:00', endTime: '12:00',
    type: 'meeting',
  },
  {
    id: 8, userId: 1,
    title: 'Групповой проект',
    description: 'Финальная презентация',
    date: fmt(addDays(today, -2)),
    startTime: '15:00', endTime: '16:30',
    type: 'meeting',
  },
  {
    id: 9, userId: 1,
    title: 'Практика по БД',
    date: fmt(addDays(today, -1)),
    startTime: '10:00', endTime: '11:30',
    type: 'task',
  },
  {
    id: 10, userId: 1,
    title: 'Стипендия',
    date: fmt(addDays(today, 5)),
    type: 'note',
  },
];

export const mockNotes: Note[] = [
  {
    id: 1, userId: 1,
    title: 'Идеи для курсовой',
    text: 'Добавить тёмную тему. Интегрировать push-уведомления через Service Worker. Рассмотреть экспорт в PDF.',
    date: fmt(today),
    createdAt: new Date().toISOString(),
  },
  {
    id: 2, userId: 1,
    title: 'Список литературы',
    text: 'Herlihy, "The Art of Multiprocessor Programming"\nKnuth, "The Art of Computer Programming"\nСтэнли, "Чистый код"',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3, userId: 1,
    title: 'Вопросы к преподавателю',
    text: '1. Нужна ли документация по REST API?\n2. Достаточно ли Docker Compose для запуска?\n3. Требования к тестам?',
    date: fmt(addDays(today, 1)),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 1, userId: 1, eventId: 1,
    message: 'Через 30 минут: Лекция по алгоритмам',
    isRead: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 2, userId: 1, eventId: 2,
    message: 'Сегодня в 14:00: Сдать курсовую',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3, userId: 1,
    message: 'Добро пожаловать в Умный Календарь!',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
