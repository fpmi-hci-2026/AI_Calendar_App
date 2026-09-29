'use client';

import type { CalendarEvent } from '@/types';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS    = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEKDAYS_XS = ['П',  'В',  'С',  'Ч',  'П',  'С',  'В'];

const EVENT_COLORS: Record<string, string> = {
  meeting: 'bg-emerald-500',
  task:    'bg-blue-500',
  note:    'bg-amber-400',
};

export default function MonthView({ currentDate, events, selectedDate, onSelectDate }: MonthViewProps) {
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1; // 0 = пн

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr    = new Date().toISOString().slice(0, 10);

  const fmt = (d: number) => {
    const dd = String(d).padStart(2, '0');
    const mm = String(month + 1).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const eventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);

  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="select-none">
      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 mb-1 sm:mb-2">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className="text-center py-1.5 sm:py-2">
            <span className="hidden sm:inline text-xs font-medium text-slate-400">{d}</span>
            <span className="sm:hidden text-[10px] font-medium text-slate-400">{WEEKDAYS_XS[i]}</span>
          </div>
        ))}
      </div>

      {/* Сетка дней */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr   = fmt(day);
          const dayEvents = eventsForDate(dateStr);
          const isToday    = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`min-h-[44px] sm:min-h-[64px] lg:min-h-[72px] p-1 sm:p-1.5 rounded-lg sm:rounded-xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className="flex justify-center mb-0.5 sm:mb-1">
                <span className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium ${
                  isToday
                    ? 'bg-emerald-500 text-white'
                    : isSelected
                    ? 'text-emerald-700'
                    : 'text-slate-700'
                }`}>
                  {day}
                </span>
              </div>
              {/* Точки событий */}
              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 2).map(ev => (
                  <div
                    key={ev.id}
                    className={`h-1 sm:h-1.5 rounded-full ${EVENT_COLORS[ev.type]}`}
                    title={ev.title}
                  />
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[9px] sm:text-[10px] text-slate-400 pl-0.5">+{dayEvents.length - 2}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
