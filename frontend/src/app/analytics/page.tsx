'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AIWidget from '@/components/AIWidget';
import { apiFetchAnalytics, apiGetMe, tokens } from '@/lib/api';
import type { AnalyticsData } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';

type Period = 'week' | 'month';

const TYPE_COLORS: Record<string, string> = {
  meeting: '#10b981',
  task:    '#3b82f6',
  note:    '#fbbf24',
};
const TYPE_LABELS: Record<string, string> = {
  meeting: 'Встречи',
  task:    'Задачи',
  note:    'Заметки',
};
const WEEKDAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const MONTH_NAMES_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

export default function AnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('week');
  const [userName, setUserName] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();

  // Диапазон дат для выбранного периода
  const { start, end, fromStr, toStr } = useMemo(() => {
    let s: Date, e: Date;
    if (period === 'week') {
      s = new Date(today);
      const day = s.getDay();
      s.setDate(s.getDate() - (day === 0 ? 6 : day - 1));
      s.setHours(0, 0, 0, 0);
      e = new Date(s); e.setDate(s.getDate() + 6);
    } else {
      s = new Date(today.getFullYear(), today.getMonth(), 1);
      e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    return {
      start: s,
      end: e,
      fromStr: s.toISOString().slice(0, 10),
      toStr: e.toISOString().slice(0, 10),
    };
  }, [period]);

  // Проверка авторизации
  useEffect(() => {
    if (!tokens.getAccess()) { router.push('/auth'); return; }
    apiGetMe()
      .then(u => setUserName(u.name))
      .catch(() => router.push('/auth'));
  }, []);

  // Загрузка аналитики при смене периода
  useEffect(() => {
    setLoading(true);
    apiFetchAnalytics(fromStr, toStr)
      .then(data => setAnalytics(data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, [fromStr, toStr]);

  // Данные для pie chart
  const pieData = useMemo(() => {
    if (!analytics) return [];
    return analytics.by_type
      .filter(d => d.count > 0)
      .map(d => ({ name: TYPE_LABELS[d.type] ?? d.type, value: d.count, type: d.type }));
  }, [analytics]);

  // Данные для bar chart
  const barData = useMemo(() => {
    if (!analytics) return [];
    if (period === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        const found = analytics.daily_activity.find(a => a.date === dateStr);
        return { name: WEEKDAYS_SHORT[i], События: found?.count ?? 0 };
      });
    } else {
      // Группируем daily_activity по неделям месяца
      const weeks: { name: string; События: number }[] = [];
      let d = new Date(start);
      let wi = 1;
      while (d <= end) {
        const weekStart = new Date(d);
        const weekEnd = new Date(d); weekEnd.setDate(d.getDate() + 6);
        const sum = analytics.daily_activity
          .filter(a => a.date >= weekStart.toISOString().slice(0, 10) && a.date <= weekEnd.toISOString().slice(0, 10))
          .reduce((acc, a) => acc + a.count, 0);
        weeks.push({ name: `Нед ${wi}`, События: sum });
        d.setDate(d.getDate() + 7);
        wi++;
      }
      return weeks;
    }
  }, [analytics, period, start, end]);

  // Итоговые цифры
  const total    = analytics?.total_events ?? 0;
  const meetings = analytics?.by_type.find(d => d.type === 'meeting')?.count ?? 0;
  const tasks    = analytics?.by_type.find(d => d.type === 'task')?.count ?? 0;
  const notes    = analytics?.by_type.find(d => d.type === 'note')?.count ?? 0;

  const periodLabel = period === 'week'
    ? `${start.getDate()} – ${end.getDate()} ${MONTH_NAMES_SHORT[end.getMonth()]}`
    : `${MONTH_NAMES_SHORT[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        userName={userName}
        notifications={[]}
        onNotificationRead={() => {}}
        onCreateEvent={() => {}}
        onLogout={() => { tokens.clear(); router.push('/auth'); }}
      />

      <main className="flex-1 px-6 py-5 max-w-5xl mx-auto w-full">
        {/* Заголовок + переключатель */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Аналитика</h1>
            <p className="text-sm text-slate-400">{periodLabel}</p>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            {(['week', 'month'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  period === p ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {p === 'week' ? 'Неделя' : 'Месяц'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Загрузка...</div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* AI Анализ */}
            <AIWidget />

            {/* Карточки итогов */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Всего событий', value: total,    color: 'text-slate-800',   bg: 'bg-slate-100' },
                { label: 'Встречи',       value: meetings, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                { label: 'Задачи',        value: tasks,    color: 'text-blue-700',    bg: 'bg-blue-50' },
                { label: 'Заметки',       value: notes,    color: 'text-amber-700',   bg: 'bg-amber-50' },
              ].map(card => (
                <div key={card.label} className={`${card.bg} rounded-2xl p-4`}>
                  <p className="text-xs text-slate-500 mb-1">{card.label}</p>
                  <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Графики */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Bar chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-semibold text-slate-800 text-sm mb-4">
                  События по {period === 'week' ? 'дням' : 'неделям'}
                </h2>
                {total === 0 ? (
                  <div className="flex items-center justify-center h-48 text-slate-300 text-sm">
                    Нет данных за выбранный период
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                      />
                      <Bar dataKey="События" fill="#10b981" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Pie chart */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-semibold text-slate-800 text-sm mb-4">По типам</h2>
                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-slate-300 text-sm">
                    Нет данных
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                        dataKey="value" paddingAngle={3}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={TYPE_COLORS[entry.type] ?? '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
