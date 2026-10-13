import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Printer,
  Sparkles,
  ShieldAlert,
  Clock,
  LogOut,
  User as UserIcon,
  Building2,
  Users2,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { VisualTheme, ClientCategory, MAX_ORDERS_COUNT } from '../types';
import { LOGO_HAN_PNG, LOGO_HAN_DATA_URL } from '../assets/logo';
import { isGuestUser } from '../services/firebaseAuth';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  theme: VisualTheme;
  setTheme: (theme: VisualTheme) => void;
  onOpenComparison?: () => void;
  onOpenPdfModal: () => void;
  onOpenCreateModal?: () => void;
  ordersCount: number;
  categoryFilter: 'all' | ClientCategory;
  setCategoryFilter: (cat: 'all' | ClientCategory) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  theme,
  setTheme,
  onOpenComparison,
  onOpenPdfModal,
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
      {/* Top Security Notice Bar */}
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
          <img
            src={LOGO_HAN_PNG}
            alt="Герб Ассоциации Хана"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md flex-shrink-0 hover:scale-105 transition-transform select-none"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = LOGO_HAN_DATA_URL;
            }}
          />
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
          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'parchment' ? 'terminal' : 'parchment')}
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs flex items-center gap-1.5 transition-colors font-mono"
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
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs flex items-center gap-1.5 transition-colors font-mono"
            title="Экспорт в PDF (A4) / Печать официальных бланков"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Печать / PDF</span>
          </button>

          {/* User Email Profile & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
              <div
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${
                  isGuestUser(user)
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-stone-900/90 border-stone-800 text-stone-300'
                }`}
                title={isGuestUser(user) ? 'Гостевой доступ: Только чтение' : `Авторизован: ${user.email}`}
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-[11px] max-w-[140px] truncate">
                  {isGuestUser(user) ? 'Гость (Только чтение)' : user.email}
                </span>
                <button
                  onClick={onLogout}
                  className="text-stone-400 hover:text-red-400 ml-1 p-0.5 rounded transition-colors cursor-pointer"
                  title="Выйти из гостевого режима / учетной записи"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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
