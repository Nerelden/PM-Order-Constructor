import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useAnimatedVisibility } from '../hooks/useAnimatedVisibility';

interface ConfirmResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmResetModal: React.FC<ConfirmResetModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { shouldRender, isClosing } = useAnimatedVisibility(isOpen, 220);

  React.useEffect(() => {
    if (!isOpen || isClosing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
      }`}
    >
      <div
        className={`bg-[#14161c] border border-red-900/60 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-stone-200 ${
          isClosing ? 'modal-panel-exit' : 'modal-panel'
        }`}
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="Закрыть окно"
          className="absolute top-4 right-4 z-30 w-9 h-9 flex items-center justify-center rounded-xl bg-stone-900/90 hover:bg-red-950/80 border border-stone-800 hover:border-red-600/50 text-stone-400 hover:text-red-300 transition-all shadow-md cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cinzel text-lg font-bold text-stone-100">
              Полная Очистка Реестра
            </h2>
            <p className="text-xs sm:text-[13px] text-stone-400 font-mono-code">
              Удаление всех действующих контрактов
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-sm text-stone-200 space-y-2.5 mb-6">
          <div className="flex items-center gap-2 text-red-400 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Внимание: безвозвратное удаление</span>
          </div>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Вы собираетесь сбросить реестр и удалить <strong>все контракты</strong>. В реестре не останется ни одного заказа. Это действие синхронизируется у всех пользователей в реальном времени.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-stone-300 hover:text-white text-xs sm:text-sm font-medium cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={isClosing}
            onClick={() => {
              if (!isOpen || isClosing) return;
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-950/50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Удалить все контракты</span>
          </button>
        </div>
      </div>
    </div>
  );
};
