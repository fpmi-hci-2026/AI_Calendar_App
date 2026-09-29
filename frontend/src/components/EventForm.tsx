'use client';

import { useState, useEffect } from 'react';
import type { CalendarEvent, EventType } from '@/types';

interface EventFormProps {
  initialDate?: string;
  event?: CalendarEvent | null;
  onSave: (event: Omit<CalendarEvent, 'id' | 'userId'>) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'meeting', label: 'Встреча' },
  { value: 'task',    label: 'Задача' },
  { value: 'note',    label: 'Заметка' },
];

export default function EventForm({ initialDate, event, onSave, onClose }: EventFormProps) {
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [date, setDate]         = useState(initialDate ?? new Date().toISOString().slice(0, 10));
  const [startTime, setStart]   = useState('');
  const [endTime, setEnd]       = useState('');
  const [type, setType]         = useState<EventType>('meeting');
  const [link, setLink]         = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDesc(event.description ?? '');
      setDate(event.date);
      setStart(event.startTime ?? '');
      setEnd(event.endTime ?? '');
      setType(event.type);
      setLink(event.link ?? '');
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Введите название'); return; }
    if (!date)          { setError('Выберите дату'); return; }
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      type,
      link: link.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">
            {event ? 'Редактировать событие' : 'Новое событие'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Тип */}
          <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  type === opt.value
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Название *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: Встреча с командой"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="Дополнительные детали..."
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            />
          </div>

          {/* Дата + время */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Дата *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Начало</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStart(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Конец</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEnd(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Ссылка */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ссылка</label>
            <input
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Кнопки */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {event ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
