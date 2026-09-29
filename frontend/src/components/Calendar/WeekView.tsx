'use client';

import type { CalendarEvent } from '@/types';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const TYPE_STYLES: Record<string, string> = {
  meeting: 'bg-emerald-100 border-emerald-400 text-emerald-800',
  task:    'bg-blue-100 border-blue-400 text-blue-800',
  note:    'bg-amber-100 border-amber-400 text-amber-800',
};

const TYPE_LABELS: Record<string, string> = {
  meeting: 'Встреча',
  task:    'Задача',
  note:    'Заметка',
};

export default function WeekView({ currentDate, events, selectedDate, onSelectDate }: WeekViewProps) {
  // Найти понедельник текущей недели
  const getMonday = (d: Date) => {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    dt.setDate(dt.getDate() + diff);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const monday = getMonday(currentDate);
  const todayStr = new Date().toISOString().slice(0, 10);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-2">
      {weekDays.map((day, i) => {
        const dateStr = fmt(day);
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selectedDate;

        return (
          <div
            key={dateStr}
            onClick={() => onSelectDate(dateStr)}
            className={`flex gap-4 p-3 rounded-xl cursor-pointer transition-all border ${
              isSelected
                ? 'bg-emerald-50 border-emerald-200'
                : 'border-transparent hover:bg-slate-50'
            }`}
          >
            {/* День */}
            <div className="w-16 shrink-0 flex flex-col items-center justify-start pt-0.5">
              <span className="text-xs text-slate-400">{WEEKDAYS[i]}</span>
              <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold mt-0.5 ${
                isToday
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-700'
              }`}>
                {day.getDate()}
              </span>
            </div>

            {/* События */}
            <div className="flex-1 flex flex-col gap-1.5 min-h-[40px]">
              {dayEvents.length === 0 ? (
                <span className="text-xs text-slate-300 self-center mt-2">нет событий</span>
              ) : (
                dayEvents.map(ev => (
                  <div
                    key={ev.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-l-2 text-sm ${TYPE_STYLES[ev.type]}`}
                  >
                    {ev.startTime && (
                      <span className="text-xs font-medium opacity-60 shrink-0">{ev.startTime}</span>
                    )}
                    <span className="font-medium truncate">{ev.title}</span>
                    <span className="ml-auto text-xs opacity-50 shrink-0">{TYPE_LABELS[ev.type]}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
