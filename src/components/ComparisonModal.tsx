import React, { useState } from 'react';
import { X, Scale, AlertTriangle, Coins, ShieldCheck, Target, ArrowRightLeft } from 'lucide-react';
import { OrderContract } from '../types';

interface ComparisonModalProps {
  orders: OrderContract[];
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  orders,
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || orders.length < 2) return null;

  const [order1Id, setOrder1Id] = useState<string>(orders[0]?.id || '');
  const [order2Id, setOrder2Id] = useState<string>(orders[1]?.id || '');

  const order1 = orders.find((o) => o.id === order1Id) || orders[0];
  const order2 = orders.find((o) => o.id === order2Id) || orders[1] || orders[0];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-[#12141a] border border-amber-900/40 rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl relative text-stone-200 max-h-[90vh] overflow-y-auto">
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
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cinzel text-lg font-bold text-stone-100">
              Сравнительный Анализ Заказов
            </h2>
            <p className="text-xs text-stone-400 font-mono-code">
              Сопоставление любых двух контрактов реестра Города
            </p>
          </div>
        </div>

        {/* Order Selectors for Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 p-3 rounded-xl bg-stone-950/70 border border-stone-800">
          <div>
            <label className="block text-[11px] font-mono text-stone-400 mb-1">
              Первый контракт для сравнения:
            </label>
            <select
              value={order1.id}
              onChange={(e) => setOrder1Id(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-stone-200 font-mono"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.code} — {o.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-stone-400 mb-1">
              Второй контракт для сравнения:
            </label>
            <select
              value={order2.id}
              onChange={(e) => setOrder2Id(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-stone-200 font-mono"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.code} — {o.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-side comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order 1 Card */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-950 border border-stone-700 text-amber-300">
                  {order1.code}
                </span>
                <span className="text-xs font-bold text-stone-400 uppercase font-mono">
                  {order1.client}
                </span>
              </div>
              <h3 className="font-serif-header text-base font-bold text-stone-100">
                {order1.title}
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                {order1.objective}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-stone-950/80 border border-stone-800">
                  <span className="text-stone-400 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    Награда:
                  </span>
                  <span className="font-bold text-amber-300 font-mono">
                    {order1.rewardAhn.toLocaleString('ru-RU')} Ан
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-stone-950/80 border border-stone-800">
                  <span className="text-stone-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Ранг допуска:
                  </span>
                  <span className="font-semibold text-stone-200">
                    {order1.gradeRequirement}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-red-950/20 border border-red-900/40 text-red-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-red-400 text-[11px] uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Ключевые угрозы:
                  </span>
                  <ul className="text-[11px] text-stone-300 list-disc pl-4 space-y-0.5">
                    {order1.threats.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectOrder(order1.id);
                onClose();
              }}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold border border-stone-700 transition-colors"
            >
              Сфокусироваться на данном заказе
            </button>
          </div>

          {/* Order 2 Card */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-950 border border-stone-700 text-amber-300">
                  {order2.code}
                </span>
                <span className="text-xs font-bold text-stone-400 uppercase font-mono">
                  {order2.client}
                </span>
              </div>
              <h3 className="font-serif-header text-base font-bold text-stone-100">
                {order2.title}
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                {order2.objective}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-stone-950/80 border border-stone-800">
                  <span className="text-stone-400 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    Награда:
                  </span>
                  <span className="font-bold text-amber-300 font-mono">
                    {order2.rewardAhn.toLocaleString('ru-RU')} Ан
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-stone-950/80 border border-stone-800">
                  <span className="text-stone-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Ранг допуска:
                  </span>
                  <span className="font-semibold text-stone-200">
                    {order2.gradeRequirement}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-red-950/20 border border-red-900/40 text-red-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-red-400 text-[11px] uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Ключевые угрозы:
                  </span>
                  <ul className="text-[11px] text-stone-300 list-disc pl-4 space-y-0.5">
                    {order2.threats.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectOrder(order2.id);
                onClose();
              }}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold border border-stone-700 transition-colors"
            >
              Сфокусироваться на данном заказе
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
