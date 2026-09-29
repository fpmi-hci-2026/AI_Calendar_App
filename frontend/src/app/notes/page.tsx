'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import type { Note } from '@/types';
import { apiFetchNotes, apiCreateNote, apiUpdateNote, apiDeleteNote, apiGetMe, tokens } from '@/lib/api';

export default function NotesPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [formDate, setFormDate] = useState('');

  useEffect(() => {
    if (!tokens.getAccess()) { router.push('/auth'); return; }
    apiGetMe()
      .then(u => setUserName(u.name))
      .catch(() => router.push('/auth'));
    apiFetchNotes()
      .then(data => setNotes(data))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormText('');
    setFormDate('');
    setShowForm(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormText(note.text);
    setFormDate(note.date ?? '');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formText.trim()) return;
    try {
      if (editingNote) {
        const updated = await apiUpdateNote(editingNote.id, {
          title: formTitle || 'Без названия',
          text: formText,
          date: formDate || undefined,
        });
        setNotes(prev => prev.map(n => n.id === editingNote.id ? updated : n));
      } else {
        const created = await apiCreateNote({
          title: formTitle || 'Без названия',
          text: formText,
          date: formDate || undefined,
        });
        setNotes(prev => [created, ...prev]);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDeleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        userName={userName}
        notifications={[]}
        onNotificationRead={() => {}}
        onCreateEvent={() => {}}
        onLogout={() => { tokens.clear(); router.push('/auth'); }}
      />

      <main className="flex-1 px-6 py-5 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Заметки</h1>
            <p className="text-sm text-slate-400">{notes.length} заметок</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Новая заметка
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Загрузка...</div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p className="text-slate-400">Нет заметок</p>
            <button onClick={openNew} className="mt-2 text-emerald-600 text-sm hover:underline">Создать первую заметку</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => (
              <div key={note.id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2 group hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{note.title}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(note)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(note.id)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap flex-1">{note.text}</p>
                <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-50">
                  {note.date && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      {new Date(note.date + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">{fmt(note.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">{editingNote ? 'Редактировать заметку' : 'Новая заметка'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
                <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Название заметки"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Текст *</label>
                <textarea value={formText} onChange={e => setFormText(e.target.value)} placeholder="Содержание заметки..." rows={5}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Дата (необязательно)</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"/>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50">Отмена</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors">
                  {editingNote ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
