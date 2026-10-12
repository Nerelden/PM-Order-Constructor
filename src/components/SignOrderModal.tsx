import React, { useState, useEffect } from 'react';
import { X, Stamp, ShieldCheck, PenTool, Calendar } from 'lucide-react';
import { OrderContract } from '../types';

interface SignOrderModalProps {
  order: OrderContract | null;
  isOpen: boolean;
  onClose: () => void;
  onSign: (
    orderId: string,
    fixerName: string,
    officeName: string,
    stampText: string,
    signedDate: string
  ) => void;
}

const SIGNATURE_CACHE_KEY = 'pm_fixer_signature_cache';

interface CachedSignature {
  fixerName: string;
  officeName: string;
  stampStyle: string;
}

const getCachedSignature = (): CachedSignature => {
  try {
    const raw = localStorage.getItem(SIGNATURE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          fixerName: typeof parsed.fixerName === 'string' && parsed.fixerName ? parsed.fixerName : 'Фиксер Ранга 7',
          officeName: typeof parsed.officeName === 'string' ? parsed.officeName : 'Независимое Бюро Города',
          stampStyle: typeof parsed.stampStyle === 'string' && parsed.stampStyle ? parsed.stampStyle : 'ПРИНЯТО К ИСПОЛНЕНИЮ',
        };
      }
    }
  } catch (e) {
    console.error('Failed to read signature cache', e);
  }
  return {
    fixerName: 'Фиксер Ранга 7',
    officeName: 'Независимое Бюро Города',
    stampStyle: 'ПРИНЯТО К ИСПОЛНЕНИЮ',
  };
};

const saveCachedSignature = (data: Partial<CachedSignature>) => {
  try {
    const current = getCachedSignature();
    const updated = { ...current, ...data };
    localStorage.setItem(SIGNATURE_CACHE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save signature cache', e);
  }
};

export const SignOrderModal: React.FC<SignOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSign,
}) => {
  const getTodayISO = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [fixerName, setFixerName] = useState(() => getCachedSignature().fixerName);
  const [officeName, setOfficeName] = useState(() => getCachedSignature().officeName);
  const [acceptanceDate, setAcceptanceDate] = useState(getTodayISO());
  const [stampStyle, setStampStyle] = useState(() => getCachedSignature().stampStyle);
  const [rememberSignature, setRememberSignature] = useState(true);
  const [hasCachedData, setHasCachedData] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const cached = getCachedSignature();
    const rawCache = localStorage.getItem(SIGNATURE_CACHE_KEY);
    setHasCachedData(Boolean(rawCache));

    setFixerName(order?.assignedFixer || cached.fixerName);
    setOfficeName(order?.assignedOffice || cached.officeName);
    setStampStyle(order?.stampText || cached.stampStyle);
    setAcceptanceDate(getTodayISO());
  }, [isOpen, order]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixerName.trim()) return;

    if (rememberSignature) {
      saveCachedSignature({
        fixerName: fixerName.trim(),
        officeName: officeName.trim(),
        stampStyle,
      });
    }

    // Format date nicely (e.g. DD.MM.YYYY)
    let formattedDate = acceptanceDate;
    try {
      const [year, month, day] = acceptanceDate.split('-');
      if (year && month && day) {
        formattedDate = `${day}.${month}.${year}`;
      }
    } catch {
      formattedDate = acceptanceDate;
    }

    onSign(order.id, fixerName.trim(), officeName.trim(), stampStyle, formattedDate);
    onClose();
  };

  const STAMP_OPTIONS = [
    'ПРИНЯТО К ИСПОЛНЕНИЮ',
    'КОНТРАКТ СВЯЗАН ОБЯЗАТЕЛЬСТВОМ',
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-[#14161c] border border-amber-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-stone-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          aria-label="Закрыть окно"
          className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-xl bg-stone-900/90 hover:bg-red-950/80 border border-stone-800 hover:border-red-600/50 text-stone-400 hover:text-red-300 transition-all shadow-md cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Stamp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-base font-bold text-stone-100">
                Подписание Листа Заказа
              </h2>
              {hasCachedData && (
                <span className="text-[10px] text-amber-300 font-mono bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  Кэш активен
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 font-mono-code truncate max-w-xs">
              {order.code} — {order.title}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Acceptance Date Field */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Calendar className="w-3.5 h-3.5" />
                Дата принятия заказа:
              </span>
              <button
                type="button"
                onClick={() => setAcceptanceDate(getTodayISO())}
                className="text-[10px] text-amber-400 hover:underline lowercase font-normal"
              >
                сегодня
              </button>
            </label>
            <input
              type="date"
              value={acceptanceDate}
              onChange={(e) => setAcceptanceDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-stone-900/90 border border-amber-600/50 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-amber-400 font-mono-code"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Дата фиксируется в официальном реестре Города и оттиске печати.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
              Позывной / Имя Фиксера
            </label>
            <input
              type="text"
              value={fixerName}
              onChange={(e) => setFixerName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-stone-900/90 border border-stone-700 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              placeholder="Например: Роланд, Фиксер Ранга 7"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
              Принадлежность (Офис / Мастерская / Синдикат)
            </label>
            <input
              type="text"
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-900/90 border border-stone-700 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              placeholder="Например: Офис Чарльза / Свободный агент"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Тип сургучного штампа договора
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {STAMP_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setStampStyle(opt)}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-mono-code transition-all flex items-center justify-between ${
                    stampStyle === opt
                      ? 'bg-amber-950/60 border border-amber-500/60 text-amber-200'
                      : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:text-stone-300'
                  }`}
                >
                  <span>{opt}</span>
                  {stampStyle === opt && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Stamp Preview */}
          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 flex flex-col items-center justify-center gap-1.5">
            <div className="border-2 border-dashed border-red-600/70 text-red-400 px-4 py-1.5 rounded uppercase font-bold tracking-widest text-xs rotate-[-2deg] font-cinzel">
              [ {stampStyle} ]
            </div>
            <div className="text-[10px] font-mono-code text-stone-400">
              ДАТА ПОДПИСАНИЯ: <span className="text-amber-300 font-bold">{acceptanceDate}</span>
            </div>
          </div>

          {/* Cache memory option */}
          <div className="flex items-center gap-2 px-1 text-xs text-stone-300 font-mono">
            <input
              type="checkbox"
              id="rememberSignature"
              checked={rememberSignature}
              onChange={(e) => setRememberSignature(e.target.checked)}
              className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0 cursor-pointer accent-amber-500"
            />
            <label htmlFor="rememberSignature" className="cursor-pointer select-none text-stone-300">
              Запоминать данные подписи в кэше для следующих заказов
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-colors"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Поставить печать с датой</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
