'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Notification } from '@/types';

interface HeaderProps {
  userName: string;
  notifications: Notification[];
  onNotificationRead: (id: number) => void;
  onCreateEvent: () => void;
  onLogout?: () => void;
}

export default function Header({
  userName,
  notifications,
  onNotificationRead,
  onCreateEvent,
  onLogout,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unread = notifications.filter(n => !n.isRead).length;
  const showCreateBtn = pathname === '/dashboard';

  const navItems = [
    { href: '/dashboard', label: 'Календарь' },
    { href: '/notes',     label: 'Заметки' },
    { href: '/analytics', label: 'Аналитика' },
  ];

  const handleLogout = () => {
    setMobileMenuOpen(false);
    onLogout ? onLogout() : router.push('/auth');
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">

        {/* Логотип */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs sm:text-sm font-bold">УК</span>
          </div>
          <span className="font-semibold text-slate-800 text-sm sm:text-base hidden xs:block">Умный Календарь</span>
        </div>

        {/* Десктопная навигация */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Правая часть */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Кнопка создать событие — только на /dashboard */}
          {showCreateBtn && (
            <>
              <button
                onClick={onCreateEvent}
                className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <span className="text-base leading-none">+</span>
                <span className="hidden sm:inline">Событие</span>
              </button>

              <button
                onClick={onCreateEvent}
                className="sm:hidden w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-colors text-lg font-medium"
              >
                +
              </button>
            </>
          )}

          {/* Уведомления */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setMobileMenuOpen(false); }}
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-sm">Уведомления</span>
                  {unread > 0 && (
                    <span className="text-xs text-emerald-600 font-medium">{unread} новых</span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">Нет уведомлений</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => onNotificationRead(n.id)}
                        className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                          !n.isRead ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          )}
                          <p className={`text-sm ${!n.isRead ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Аватар + имя — только десктоп */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-100">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="text-slate-600 text-xs font-semibold">
                {userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-600 hidden lg:block max-w-[120px] truncate">{userName}</span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Выйти"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* Hamburger — только мобиле/планшет */}
          <button
            onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setShowNotifications(false); }}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1 border-t border-slate-100">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="text-slate-600 text-xs font-semibold">
                {userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-600 flex-1 truncate">{userName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Выйти
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
