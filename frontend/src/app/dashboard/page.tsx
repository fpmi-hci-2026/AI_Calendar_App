'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import MonthView from '@/components/Calendar/MonthView';
import WeekView from '@/components/Calendar/WeekView';
import EventForm from '@/components/EventForm';
import type { CalendarEvent, CalendarView, Notification } from '@/types';
import {
  apiFetchEvents, apiCreateEvent, apiUpdateEvent, apiDeleteEvent,
  apiCreateNote, apiFetchNotes, apiGetMe, tokens,
} from '@/lib/api';
import type { Note } from '@/types';

const TYPE_STYLES: Record<string, string> = {
  meeting: 'border-l-emerald-500 bg-emerald-50',
  task:    'border-l-blue-500 bg-blue-50',
  note:    'border-l-amber-400 bg-amber-50',
};
const TYPE_LABELS: Record<string, string> = {
  meeting: 'Встреча', task: 'Задача', note: 'Заметка',
};
const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

export default function DashboardPage() {
  const router = useRouter();
  const today = new Date();

  const [userName, setUserName] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notifications] = useState<Notification[]>([]);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState<CalendarView>('month');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  // На мобиле: показывать список событий под календарём
  const [showEventsList, setShowEventsList] = useState(false);
  // Быстрое создание заметки
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    if (!tokens.getAccess()) { router.push('/auth'); return; }
    apiGetMe()
      .then(u => setUserName(u.name))
      .catch(() => router.push('/auth'));
  }, []);

  const loadEvents = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const y = date.getFullYear();
      const m = date.getMonth();
      const from = new Date(y, m - 1, 1).toISOString().slice(0, 10);
      const to   = new Date(y, m + 2, 0).toISOString().slice(0, 10);
      const [eventsData, notesData] = await Promise.all([
        apiFetchEvents(from, to),
        apiFetchNotes(),
      ]);
      setEvents(eventsData);
      setNotes(notesData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(currentDate); }, [currentDate]);

  // Заметки с датой → псевдо-события для отображения точек в календаре
  const noteEvents: CalendarEvent[] = notes
    .filter(n => n.date)
    .map(n => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      description: n.text,
      date: n.date!,
      type: 'note' as const,
    }));

  // Объединённый список для MonthView / WeekView
  const calendarItems = [...events, ...noteEvents];

  const selectedEvents = events
    .filter(e => e.date === selectedDate)
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));

  // Заметки выбранного дня для правой панели
  const selectedNotes = notes.filter(n => n.date === selectedDate);

  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };
  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const periodLabel = () => {
    if (view === 'month') return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    const getMonday = (d: Date) => { const dt = new Date(d); const day = dt.getDay(); dt.setDate(dt.getDate() - (day === 0 ? 6 : day - 1)); return dt; };
    const mon = getMonday(currentDate);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return `${mon.getDate()} – ${sun.getDate()} ${MONTH_NAMES[sun.getMonth()]} ${sun.getFullYear()}`;
  };

  const handleSave = async (data: Omit<CalendarEvent, 'id' | 'userId'>) => {
    try {
      if (editingEvent) {
        const updated = await apiUpdateEvent(editingEvent.id, data);
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? updated : e));
      } else {
        const created = await apiCreateEvent(data);
        setEvents(prev => [...prev, created]);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDeleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setShowEventsList(true); // на мобиле раскрываем список при выборе даты
  };

  const openNoteForm = () => {
    setNoteTitle('');
    setNoteText('');
    setShowNoteForm(true);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      await apiCreateNote({
        title: noteTitle.trim() || 'Без названия',
        text: noteText.trim(),
        date: selectedDate,
      });
      setShowNoteForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сохранения заметки');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleLogout = () => {
    tokens.clear();
    router.push('/auth');
  };

  const selectedDateLabel = selectedDate === today.toISOString().slice(0, 10)
    ? 'Сегодня'
    : new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        userName={userName}
        notifications={notifications}
        onNotificationRead={() => {}}
        onCreateEvent={() => { setEditingEvent(null); setShowForm(true); }}
        onLogout={handleLogout}
      />

      <main className="flex flex-col lg:flex-row flex-1 gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-5 overflow-hidden">

        {/* Левая панель — календарь */}
        <section className="flex-1 bg-white rounded-2xl shadow-sm p-3 sm:p-5 flex flex-col min-w-0">
          {/* Панель навигации */}
          <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <button onClick={prevPeriod} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <h2 className="font-semibold text-slate-800 text-sm sm:text-base text-center truncate">{periodLabel()}</h2>
              <button onClick={nextPeriod} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
              <button
                onClick={() => { setCurrentDate(today); setSelectedDate(today.toISOString().slice(0, 10)); }}
                className="hidden sm:block px-3 py-1 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
              >
                Сегодня
              </button>
            </div>
            <div className="flex rounded-lg bg-slate-100 p-0.5 shrink-0">
              {(['month', 'week'] as CalendarView[]).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all ${
                    view === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {v === 'month' ? 'Месяц' : 'Нед.'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Загрузка...</div>
            ) : view === 'month' ? (
              <MonthView currentDate={currentDate} events={calendarItems} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
            ) : (
              <WeekView currentDate={currentDate} events={calendarItems} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
            {[{color:'bg-emerald-500',label:'Встреча'},{color:'bg-blue-500',label:'Задача'},{color:'bg-amber-400',label:'Заметка'}].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Правая панель — события дня */}
        {/* На мобиле: аккордеон-кнопка + выдвижная панель */}
        <aside className="lg:w-80 lg:shrink-0 flex flex-col gap-4">
          {/* Мобильная кнопка раскрытия */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setShowEventsList(!showEventsList)}
              className="flex-1 flex items-center justify-between bg-white rounded-2xl shadow-sm px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-sm">{selectedDateLabel}</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{selectedEvents.length + selectedNotes.length}</span>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${showEventsList ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <button
              onClick={openNoteForm}
              className="bg-amber-400 hover:bg-amber-500 text-white rounded-2xl px-3 py-3 flex items-center gap-1.5 text-sm font-medium transition-colors shrink-0 shadow-sm"
              title="Быстрая заметка"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
          </div>

          {/* Панель событий */}
          <div className={`bg-white rounded-2xl shadow-sm p-4 flex flex-col flex-1 ${
            showEventsList ? 'block' : 'hidden lg:flex'
          }`}>
            <div className="hidden lg:flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 text-sm">{selectedDateLabel}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{selectedEvents.length + selectedNotes.length} записей</span>
                <button
                  onClick={openNoteForm}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Заметка
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto lg:flex-1">
              {selectedEvents.length === 0 && selectedNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400">Нет событий</p>
                  <button onClick={() => { setEditingEvent(null); setShowForm(true); }} className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    + Создать событие
                  </button>
                </div>
              ) : (
                <>
                {selectedEvents.map(ev => (
                  <article key={ev.id} className={`border-l-2 px-3 py-2.5 rounded-r-xl ${TYPE_STYLES[ev.type]}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {ev.startTime && (
                          <p className="text-xs text-slate-500 mb-0.5">{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</p>
                        )}
                        <p className="font-medium text-sm text-slate-800 truncate">{ev.title}</p>
                        {ev.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ev.description}</p>}
                        <span className="inline-block mt-1 text-[10px] font-medium text-slate-400 uppercase tracking-wide">{TYPE_LABELS[ev.type]}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => { setEditingEvent(ev); setShowForm(true); }} className="p-1 rounded-lg hover:bg-white/70 text-slate-400 hover:text-slate-600 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(ev.id)} className="p-1 rounded-lg hover:bg-white/70 text-slate-400 hover:text-red-500 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    {ev.link && (
                      <a href={ev.link} target="_blank" rel="noopener noreferrer" className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                        Открыть ссылку
                      </a>
                    )}
                  </article>
                ))}

                {/* Заметки выбранного дня */}
                {selectedNotes.length > 0 && (
                  <>
                    {selectedEvents.length > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide shrink-0">Заметки</span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>
                    )}
                    {selectedNotes.map(note => (
                      <div key={note.id} className="border-l-2 border-l-amber-400 bg-amber-50 px-3 py-2.5 rounded-r-xl">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-800 truncate">{note.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{note.text}</p>
                          </div>
                          <a
                            href="/notes"
                            className="p-1 rounded-lg hover:bg-amber-100 text-amber-500 transition-colors shrink-0"
                            title="Открыть в заметках"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                </>
              )}
            </div>
          </div>
        </aside>
      </main>

      {showForm && (
        <EventForm
          initialDate={selectedDate}
          event={editingEvent}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingEvent(null); }}
        />
      )}

      {/* Быстрая заметка */}
      {showNoteForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">Быстрая заметка</h2>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
              </div>
              <button onClick={() => setShowNoteForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <input
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                placeholder="Название (необязательно)"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Текст заметки..."
                rows={4}
                autoFocus
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowNoteForm(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                  Отмена
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={!noteText.trim() || noteSaving}
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {noteSaving ? 'Сохраняю...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
