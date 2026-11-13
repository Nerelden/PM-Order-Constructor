import React, { useState, useEffect } from 'react';
import { X, Calendar, RotateCcw, Check, Loader2 } from 'lucide-react';
import {
  CityDate,
  DEFAULT_CITY_DATE,
  MONTH_NAMES_NOMINATIVE,
  getDaysInMonth,
  normalizeCityDate,
  formatCityDate,
} from '../types';
import { useAnimatedVisibility } from '../hooks/useAnimatedVisibility';

interface CityDateModalProps {
  isOpen: boolean;
  cityDate: CityDate;
  onClose: () => void;
  onSave: (newDate: CityDate) => Promise<void>;
}

export const CityDateModal: React.FC<CityDateModalProps> = ({
  isOpen,
  cityDate,
  onClose,
  onSave,
}) => {
  const { shouldRender, isClosing } = useAnimatedVisibility(isOpen, 220);

  const [day, setDay] = useState<string>(String(cityDate.day));
  const [month, setMonth] = useState<number>(cityDate.month);
  const [year, setYear] = useState<string>(String(cityDate.year));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const normalized = normalizeCityDate(cityDate);
    setDay(String(normalized.day));
    setMonth(normalized.month);
    setYear(String(normalized.year));
    setErrorMessage(null);
    setIsSaving(false);
  }, [isOpen, cityDate]);

  useEffect(() => {
    if (!isOpen || isClosing || isSaving) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing, isSaving, onClose]);

  if (!shouldRender) return null;

  const parsedYear = Math.max(1, Math.min(99999, Math.trunc(Number(year) || DEFAULT_CITY_DATE.year)));
  const maxDay = getDaysInMonth(month, parsedYear);
  const previewDate = normalizeCityDate({
    day: Number(day) || DEFAULT_CITY_DATE.day,
    month,
    year: parsedYear,
  });

  const handleMonthChange = (nextMonth: number) => {
    setMonth(nextMonth);
    const nextMaxDay = getDaysInMonth(nextMonth, parsedYear);
    const currentDay = Number(day);
    if (Number.isFinite(currentDay) && currentDay > nextMaxDay) {
      setDay(String(nextMaxDay));
    }
  };

  const handleResetDefault = () => {
    setDay(String(DEFAULT_CITY_DATE.day));
    setMonth(DEFAULT_CITY_DATE.month);
    setYear(String(DEFAULT_CITY_DATE.year));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOpen || isClosing || isSaving) return;

    const numDay = Math.trunc(Number(day));
    const numYear = Math.trunc(Number(year));

    if (!Number.isFinite(numYear) || numYear < 1 || numYear > 99999) {
      setErrorMessage('Укажите корректный год от 1 до 99999.');
      return;
    }

    const allowedDays = getDaysInMonth(month, numYear);
    if (!Number.isFinite(numDay) || numDay < 1 || numDay > allowedDays) {
      setErrorMessage(`В выбранном месяце от 1 до ${allowedDays} дней.`);
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      await onSave(normalizeCityDate({ day: numDay, month, year: numYear }));
      onClose();
    } catch {
      setErrorMessage('Не удалось сохранить дату. Проверьте права доступа.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
      }`}
    >
      <div
        className={`bg-[#14161c] border border-amber-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-stone-200 ${
          isClosing ? 'modal-panel-exit' : 'modal-panel'
        }`}
      >
        <button
          onClick={onClose}
          type="button"
          disabled={isSaving}
          aria-label="Закрыть окно"
          className="absolute top-4 right-4 z-30 w-9 h-9 flex items-center justify-center rounded-xl bg-stone-900/90 hover:bg-red-950/80 border border-stone-800 hover:border-red-600/50 text-stone-400 hover:text-red-300 transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cinzel text-lg font-bold text-stone-100">
              Дата Города
            </h2>
            <p className="text-xs text-stone-400 font-mono-code mt-0.5">
              Синхронизируется для всех пользователей реестра
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                День
              </label>
              <input
                type="number"
                min={1}
                max={maxDay}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-mono-code"
              />
            </div>

            <div className="col-span-5">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Месяц
              </label>
              <select
                value={month}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-stone-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {MONTH_NAMES_NOMINATIVE.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-4">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Год
              </label>
              <input
                type="number"
                min={1}
                max={99999}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-stone-900/90 border border-stone-700 rounded-xl text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-mono-code"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between gap-2 flex-wrap">
            <div>
              <div className="text-[11px] font-mono text-stone-400 uppercase">
                Отображение в реестре:
              </div>
              <div className="text-sm font-bold text-amber-300 font-mono-code mt-0.5">
                {formatCityDate(previewDate)}
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetDefault}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-700 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Установить стандартную дату: 9 июля 983 года"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>9 июля 983</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-700/60 text-xs text-red-200 font-mono">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-stone-300 hover:text-white text-xs sm:text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Сохранить дату</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
