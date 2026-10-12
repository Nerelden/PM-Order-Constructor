import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { OrderContract } from '../types';

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
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#14161c] border border-red-900/60 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cinzel text-base font-bold text-stone-100">
              Аннулирование Листа Заказа
            </h2>
            <p className="text-xs text-stone-400 font-mono-code">
              Удаление из единого реестра Города
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 text-xs text-stone-300 space-y-2 mb-5">
          <div className="font-semibold text-stone-100">
            {order.code} — {order.title}
          </div>
          <p className="text-stone-400 leading-relaxed">
            Вы действительно хотите списать данный контракт? Данный лист будет немедленно удален у всех пользователей в реальном времени.
          </p>
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
            type="button"
            onClick={() => {
              onConfirm(order.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Удалить для всех</span>
          </button>
        </div>
      </div>
    </div>
  );
};
