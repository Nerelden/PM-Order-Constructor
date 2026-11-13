import React from 'react';
import { User } from 'firebase/auth';
import {
  Sparkles,
  Calendar,
  Edit3,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { VisualTheme, CityDate, formatCityDate } from '../types';
import { LOGO_HAN_PNG, LOGO_HAN_DATA_URL } from '../assets/logo';
import { isGuestUser } from '../services/firebaseAuth';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  theme: VisualTheme;
  setTheme: (theme: VisualTheme) => void;
  cityDate: CityDate;
  onOpenCityDateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  theme,
  setTheme,
  cityDate,
  onOpenCityDateModal,
}) => {
  const isGuest = isGuestUser(user);
  const formattedDate = formatCityDate(cityDate);

  return (
    <header className="no-print border-b border-amber-900/30 bg-[#0e1117]/95 relative z-40 transition-colors">
      {/* Top Security Notice Bar */}
      <div className="bg-gradient-to-r from-amber-950/60 via-stone-900/80 to-amber-950/60 border-b border-amber-500/20 px-4 sm:px-6 py-2 text-xs sm:text-[13px] flex flex-wrap items-center justify-between gap-2 text-amber-200/85 font-mono-code">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-bold tracking-wider">
            РЕЕСТР АССОЦИАЦИИ ХАНА
          </span>
          <span className="hidden sm:inline text-stone-500">|</span>
          <span className="hidden sm:inline text-stone-300">
            ЕДИНЫЙ АРХИВ ОФИЦИАЛЬНЫХ ЗАКАЗОВ ГОРОДА
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-[13px]">
          {!isGuest ? (
            <button
              type="button"
              onClick={onOpenCityDateModal}
              className="flex items-center gap-1.5 text-stone-200 hover:text-amber-200 bg-stone-900/60 hover:bg-stone-800/80 border border-amber-500/25 hover:border-amber-400/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Настроить текущую дату Города"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>
                ВРЕМЯ ГОРОДА: <strong className="text-amber-300">{formattedDate}</strong>
              </span>
              <Edit3 className="w-3 h-3 text-amber-400/80 ml-0.5 flex-shrink-0" />
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 text-stone-200 px-1.5 py-0.5"
              title="Только персонал может настраивать дату Города"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>
                ВРЕМЯ ГОРОДА: <strong className="text-amber-300">{formattedDate}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <img
            src={LOGO_HAN_PNG}
            alt="Герб Ассоциации Хана"
            className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-md flex-shrink-0 hover:scale-105 transition-transform select-none"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = LOGO_HAN_DATA_URL;
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-base sm:text-lg font-bold tracking-wide text-stone-100 flex items-center gap-2">
                ЛИСТЫ ОФИЦИАЛЬНЫХ ЗАКАЗОВ
              </h1>
            </div>
            <p className="text-xs text-stone-400 max-w-2xl font-mono-code mt-0.5">
              Ассоциации • Синдикаты • Офисы Фиксеров • Частные Заказчики
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'parchment' ? 'terminal' : 'parchment')}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs sm:text-[13px] flex items-center gap-2 transition-colors font-mono cursor-pointer"
            title="Переключить визуальный стиль бланков"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">
              {theme === 'parchment' ? 'Бланк' : 'Терминал'}
            </span>
          </button>

          {/* User Email Profile & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2.5 border-l border-stone-800">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs sm:text-[13px] ${
                  isGuest
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-stone-900/90 border-stone-800 text-stone-200'
                }`}
                title={isGuest ? 'Гостевой доступ: Только чтение' : `Авторизован: ${user.email}`}
              >
                <UserIcon className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs max-w-[170px] truncate">
                  {isGuest ? 'Гость (Только чтение)' : user.email}
                </span>
                <button
                  onClick={onLogout}
                  className="text-stone-400 hover:text-red-400 ml-1 p-0.5 rounded transition-colors cursor-pointer"
                  title="Выйти из гостевого режима / учетной записи"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
