import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  Printer,
  Sparkles,
  Columns2,
  FileText,
  ShieldAlert,
  Clock,
  Compass,
  LogOut,
  User as UserIcon,
  Scale,
  PlusCircle,
  Building2,
  Users2,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { VisualTheme, ClientCategory, MAX_ORDERS_COUNT } from '../types';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onOpenExportDialog: () => void;
  theme: VisualTheme;
  setTheme: (theme: VisualTheme) => void;
  onOpenComparison: () => void;
  onOpenPdfModal: () => void;
  onOpenCreateModal: () => void;
  ordersCount: number;
  categoryFilter: 'all' | ClientCategory;
  setCategoryFilter: (cat: 'all' | ClientCategory) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  onOpenExportDialog,
  theme,
  setTheme,
  onOpenComparison,
  onOpenPdfModal,
  onOpenCreateModal,
  ordersCount,
  categoryFilter,
  setCategoryFilter,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="no-print border-b border-amber-900/30 bg-[#0e1117]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Top Security & Association Notice Bar */}
      <div className="bg-gradient-to-r from-amber-950/60 via-stone-900/80 to-amber-950/60 border-b border-amber-500/20 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between text-amber-200/80 font-mono-code">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            РЕЕСТР АССОЦИАЦИИ ХАНА
          </span>
          <span className="hidden sm:inline text-stone-500">|</span>
          <span className="hidden sm:inline text-stone-400">
            ЕДИНЫЙ АРХИВ ОФИЦИАЛЬНЫХ ЗАКАЗОВ ГОРОДА
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-stone-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>ВРЕМЯ ГОРОДА: <strong className="text-amber-300">{currentTime}</strong></span>
          </div>
          <span className="hidden md:inline px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
            РЕЕСТР: {ordersCount} / {MAX_ORDERS_COUNT} ЗАКАЗОВ
          </span>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-lg bg-gradient-to-br from-amber-600/20 to-stone-900 border border-amber-500/50 flex items-center justify-center shadow-lg shadow-amber-950/30 flex-shrink-0 group">
            <ShieldAlert className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded bg-stone-900 border border-amber-500/40 text-[9px] font-bold text-amber-300 flex items-center justify-center font-cinzel">
              H
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-base sm:text-lg font-bold tracking-wide text-stone-100 flex items-center gap-2">
                ЛИСТЫ ОФИЦИАЛЬНЫХ ЗАКАЗОВ
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-stone-800 text-amber-400 border border-stone-700">
                {ordersCount}/{MAX_ORDERS_COUNT}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 max-w-xl font-mono-code">
              Ассоциации • Синдикаты • Офисы Фиксеров • Частные Заказчики
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Universal Constructor Trigger Button */}
          <button
            onClick={onOpenCreateModal}
            disabled={ordersCount >= MAX_ORDERS_COUNT}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Открыть универсальный конструктор нового заказа"
          >
            <PlusCircle className="w-4 h-4 text-stone-950" />
            <span>+ Конструктор ({ordersCount}/{MAX_ORDERS_COUNT})</span>
          </button>

          {/* Compare Button */}
          {ordersCount >= 2 && (
            <button
              onClick={onOpenComparison}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-xs flex items-center gap-1.5 transition-colors"
              title="Сравнить риски и параметры заказов"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Сравнение</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'parchment' ? 'terminal' : 'parchment')}
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs flex items-center gap-1.5 transition-colors"
            title="Переключить визуальный стиль бланков"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {theme === 'parchment' ? 'Бланк' : 'Терминал'}
            </span>
          </button>

          {/* PDF & Print Button */}
          <button
            onClick={onOpenPdfModal}
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs flex items-center gap-1.5 transition-colors"
            title="Экспорт в PDF (A4) / Печать официальных бланков"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Печать / PDF</span>
          </button>

          {/* Export to Google Sheets */}
          <button
            onClick={onOpenExportDialog}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-1.5 font-medium transition-all shadow-sm"
            title="Экспортировать все текущие заказы в Google Таблицы"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Экспорт в Sheets</span>
          </button>

          {/* Google Account Profile / Login Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-stone-800">
              <div
                className="flex items-center gap-2 bg-stone-900/80 px-2 py-1 rounded-lg border border-stone-800 text-xs"
                title={`Подключен аккаунт: ${user.email || user.displayName}`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Пользователь'}
                    className="w-5 h-5 rounded-full border border-emerald-500/40"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-stone-400" />
                )}
                <span className="hidden xl:inline font-mono text-[11px] text-stone-300 max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={onLogout}
                  className="text-stone-400 hover:text-red-400 ml-1 p-0.5 rounded transition-colors"
                  title="Выйти из аккаунта"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="gsi-material-button text-xs py-1 px-2.5 rounded-lg bg-white hover:bg-stone-100 text-stone-800 font-medium flex items-center gap-1.5 border border-stone-300 shadow-sm transition-all disabled:opacity-50"
              title="Войти через Google"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoggingIn ? '...' : 'Войти'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs Bar */}
      <div className="bg-[#0b0d12] border-t border-stone-800/80 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-stone-500 font-mono text-[11px] mr-1 hidden sm:inline">Фильтр:</span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-md font-mono transition-all ${
              categoryFilter === 'all'
                ? 'bg-amber-600/30 text-amber-200 border border-amber-500/40 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Все ({ordersCount})
          </button>
          <button
            onClick={() => setCategoryFilter('association')}
            className={`px-2.5 py-1 rounded-md font-mono flex items-center gap-1 transition-all ${
              categoryFilter === 'association'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Building2 className="w-3 h-3 text-cyan-400" />
            <span>Ассоциации</span>
          </button>
          <button
            onClick={() => setCategoryFilter('syndicate')}
            className={`px-2.5 py-1 rounded-md font-mono flex items-center gap-1 transition-all ${
              categoryFilter === 'syndicate'
                ? 'bg-red-950 text-red-200 border border-red-500/40 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users2 className="w-3 h-3 text-red-400" />
            <span>Синдикаты</span>
          </button>
          <button
            onClick={() => setCategoryFilter('office')}
            className={`px-2.5 py-1 rounded-md font-mono flex items-center gap-1 transition-all ${
              categoryFilter === 'office'
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/40 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Briefcase className="w-3 h-3 text-emerald-400" />
            <span>Офисы</span>
          </button>
          <button
            onClick={() => setCategoryFilter('individual')}
            className={`px-2.5 py-1 rounded-md font-mono flex items-center gap-1 transition-all ${
              categoryFilter === 'individual'
                ? 'bg-purple-950 text-purple-200 border border-purple-500/40 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserCheck className="w-3 h-3 text-purple-400" />
            <span>Частные</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-stone-500 flex-shrink-0">
          Максимум до 10 активных листов
        </div>
      </div>
    </header>
  );
};
