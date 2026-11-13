import React, { useRef } from 'react';
import { X, Trash2 } from 'lucide-react';
import { OrderContract } from '../types';
import { useAnimatedVisibility } from '../hooks/useAnimatedVisibility';

interface ConfirmDeleteModalProps {
  order: OrderContract | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string) => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { shouldRender, isClosing } = useAnimatedVisibility(isOpen && !!order, 220);
  const cachedOrderRef = useRef<OrderContract | null>(order);
  if (order) cachedOrderRef.current = order;
  const activeOrder = order || cachedOrderRef.current;

  React.useEffect(() => {
    if (!isOpen || isClosing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing, onClose]);

  if (!shouldRender || !activeOrder) return null;

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
              Аннулирование Листа Заказа
            </h2>
            <p className="text-xs sm:text-[13px] text-stone-400 font-mono-code">
              Удаление из единого реестра Города
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-sm text-stone-200 space-y-2 mb-6">
          <div className="font-semibold text-stone-100">
            {activeOrder.code} — {activeOrder.title}
          </div>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Вы действительно хотите списать данный контракт? Данный лист будет немедленно удален у всех пользователей в реальном времени.
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
              onConfirm(activeOrder.id);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-950/50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Удалить для всех</span>
          </button>
        </div>
      </div>
    </div>
  );
};
