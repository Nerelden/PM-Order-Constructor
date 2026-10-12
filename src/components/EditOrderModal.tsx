import React, { useState } from 'react';
import { X, Save, Edit3, Calendar, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { OrderContract, RGBColor, rgbToHex, getOrderRgb } from '../types';
import { RgbColorSelector } from './RgbColorSelector';

interface EditOrderModalProps {
  order: OrderContract | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: OrderContract) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !order) return null;

  const initialRgb = getOrderRgb(order);
  const [formData, setFormData] = useState<OrderContract>({ ...order });
  const [colorRgb, setColorRgb] = useState<RGBColor>(initialRgb);
  const [directivesText, setDirectivesText] = useState<string>(
    (order.tacticalNotes || []).join('\n')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedDirectives = directivesText
      .split('\n')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const updated: OrderContract = {
      ...formData,
      colorRgb,
      colorHex: rgbToHex(colorRgb.r, colorRgb.g, colorRgb.b),
      rewardBonus: formData.rewardBonus?.trim() || '',
      tacticalNotes: parsedDirectives,
      watermarkUrl: formData.watermarkUrl?.trim() || '',
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#14161c] border border-stone-700 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative text-stone-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cinzel text-lg font-bold text-stone-100">
              Редактирование условий заказа
            </h2>
            <p className="text-xs text-stone-400 font-mono-code">
              {order.code} — {order.associationName}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Color Selector */}
          <RgbColorSelector
            color={colorRgb}
            onChange={(newRgb, newHex) => {
              setColorRgb(newRgb);
              setFormData((prev) => ({
                ...prev,
                colorRgb: newRgb,
                colorHex: newHex,
              }));
            }}
          />

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
              Название заказа
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Введите название заказа"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-serif-header"
            />
          </div>

          {/* Watermark URL & Text */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-stone-950/60 border border-stone-800">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-stone-400 mb-1 flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-stone-500" />
                <span>Ссылка на водяной знак (URL):</span>
              </label>
              <input
                type="url"
                value={formData.watermarkUrl || ''}
                onChange={(e) => setFormData({ ...formData, watermarkUrl: e.target.value })}
                placeholder="https://example.com/watermark.png"
                className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">
                Символ водяного знака:
              </label>
              <input
                type="text"
                value={formData.romanNumeral || ''}
                onChange={(e) => setFormData({ ...formData, romanNumeral: e.target.value })}
                placeholder="I, II, IX, Ω..."
                className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs font-cinzel text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Вознаграждение (Ан)
              </label>
              <input
                type="number"
                value={formData.rewardAhn}
                onChange={(e) =>
                  setFormData({ ...formData, rewardAhn: Number(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-amber-300 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono-code"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Дополнительный бонус (необязательно)
              </label>
              <input
                type="text"
                value={formData.rewardBonus || ''}
                onChange={(e) => setFormData({ ...formData, rewardBonus: e.target.value })}
                placeholder="Укажите дополнительный бонус (необязательно)"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Требуемый ранг / квалификация
              </label>
              <input
                type="text"
                value={formData.gradeRequirement}
                onChange={(e) =>
                  setFormData({ ...formData, gradeRequirement: e.target.value })
                }
                placeholder="Укажите требования к исполнителю"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Локация
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Укажите локацию"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Уровень угрозы
              </label>
              <select
                value={formData.threatRating}
                onChange={(e) => setFormData({ ...formData, threatRating: e.target.value })}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Слух Города (Urban Rumor)">Слух Города (Urban Rumor)</option>
                <option value="Городской Миф (Urban Myth)">Городской Миф (Urban Myth)</option>
                <option value="Городская Легенда (Urban Legend)">Городская Легенда (Urban Legend)</option>
                <option value="Городская Чума (Urban Plague)">Городская Чума (Urban Plague)</option>
                <option value="Кошмар Города (Urban Nightmare)">Кошмар Города (Urban Nightmare)</option>
                <option value="Звезда Города (Star of the City)">Звезда Города (Star of the City)</option>
              </select>
            </div>

            {formData.signedDate && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Дата принятия заказа</span>
                </label>
                <input
                  type="text"
                  value={formData.signedDate || ''}
                  onChange={(e) => setFormData({ ...formData, signedDate: e.target.value })}
                  placeholder="ДД.ММ.ГГГГ"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-300 font-mono-code focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
              Цель операции
            </label>
            <textarea
              rows={2}
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              placeholder="Опишите цель заказа"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
              Бэкграунд и предыстория
            </label>
            <textarea
              rows={3}
              value={formData.background}
              onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              placeholder="Опишите предысторию и контекст"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
              Условия и угрозы (каждая с новой строки)
            </label>
            <textarea
              rows={3}
              value={formData.threats.join('\n')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  threats: e.target.value.split('\n').filter((t) => t.trim().length > 0),
                })
              }
              placeholder="Укажите условия и угрозы"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-red-300/90 font-mono-code placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
              Подробности выполнения
            </label>
            <textarea
              rows={2}
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Укажите подробности выполнения"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* DEDICATED DIRECTIVES FIELD */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
              Особые предписания и директивы (каждое предписание с новой строки)
            </label>
            <textarea
              rows={3}
              value={directivesText}
              onChange={(e) => setDirectivesText(e.target.value)}
              placeholder="Укажите особое предписание или директиву"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-300 font-mono-code placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить изменения</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
