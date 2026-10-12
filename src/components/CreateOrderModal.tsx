import React, { useState } from 'react';
import {
  X,
  Plus,
  Building2,
  Users2,
  Briefcase,
  UserCheck,
  AlertTriangle,
  RotateCcw,
  Shuffle,
  Trash2,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { OrderContract, ClientCategory, RGBColor, rgbToHex, MAX_ORDERS_COUNT } from '../types';
import { RgbColorSelector } from './RgbColorSelector';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  onAddOrder: (newOrder: OrderContract) => void;
}

const DEFAULT_RGB: RGBColor = { r: 217, g: 119, b: 6 }; // Default warm amber

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  currentCount,
  onAddOrder,
}) => {
  const isLimitReached = currentCount >= MAX_ORDERS_COUNT;

  // Form State
  const [category, setCategory] = useState<ClientCategory>('association');
  const [colorRgb, setColorRgb] = useState<RGBColor>(DEFAULT_RGB);
  const [colorHex, setColorHex] = useState<string>(rgbToHex(DEFAULT_RGB.r, DEFAULT_RGB.g, DEFAULT_RGB.b));
  
  // Neutral inputs with empty defaults
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [associationName, setAssociationName] = useState('');
  const [associationRole, setAssociationRole] = useState('');
  const [romanNumeral, setRomanNumeral] = useState('');
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [gradeRequirement, setGradeRequirement] = useState('');
  const [location, setLocation] = useState('');
  const [threatRating, setThreatRating] = useState('Городской Миф (Urban Myth)');
  const [rewardAhn, setRewardAhn] = useState<number | ''>('');
  const [rewardBonus, setRewardBonus] = useState('');
  const [objective, setObjective] = useState('');
  const [background, setBackground] = useState('');
  const [threats, setThreats] = useState<string[]>([]);
  const [details, setDetails] = useState('');
  const [tacticalNotes, setTacticalNotes] = useState<string[]>([]);

  // Sub-inputs for list additions
  const [newThreatInput, setNewThreatInput] = useState('');
  const [newDirectiveInput, setNewDirectiveInput] = useState('');

  // Escape key handler
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Reset all fields completely
  const handleResetForm = () => {
    setCategory('association');
    setColorRgb(DEFAULT_RGB);
    setColorHex(rgbToHex(DEFAULT_RGB.r, DEFAULT_RGB.g, DEFAULT_RGB.b));
    setCode('');
    setTitle('');
    setClient('');
    setAssociationName('');
    setAssociationRole('');
    setRomanNumeral('');
    setWatermarkUrl('');
    setGradeRequirement('');
    setLocation('');
    setThreatRating('Городской Миф (Urban Myth)');
    setRewardAhn('');
    setRewardBonus('');
    setObjective('');
    setBackground('');
    setThreats([]);
    setDetails('');
    setTacticalNotes([]);
    setNewThreatInput('');
    setNewDirectiveInput('');
  };

  const generateRandomCode = (cat: ClientCategory) => {
    const prefixes: Record<ClientCategory, string> = {
      association: 'ASSN',
      syndicate: 'SYND',
      office: 'OFF',
      individual: 'IND',
    };
    const randNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefixes[cat]}-${randNum}-REQ`;
  };

  const handleAddThreat = () => {
    if (newThreatInput.trim()) {
      setThreats([...threats, newThreatInput.trim()]);
      setNewThreatInput('');
    }
  };

  const handleRemoveThreat = (index: number) => {
    setThreats(threats.filter((_, i) => i !== index));
  };

  const handleAddDirective = () => {
    if (newDirectiveInput.trim()) {
      setTacticalNotes([...tacticalNotes, newDirectiveInput.trim()]);
      setNewDirectiveInput('');
    }
  };

  const handleRemoveDirective = (index: number) => {
    setTacticalNotes(tacticalNotes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) return;

    const generatedId = `order-${Date.now()}`;
    const finalCode = code.trim() || generateRandomCode(category);
    const finalTitle = title.trim();

    const newOrder: OrderContract = {
      id: generatedId,
      code: finalCode,
      title: finalTitle.startsWith('«') ? finalTitle : `«${finalTitle}»`,
      client: client.trim() || associationName.trim() || 'Заказчик',
      clientCategory: category,
      associationName: associationName.trim() || client.trim() || 'Заказчик',
      associationRole: associationRole.trim() || 'Городской заказ',
      associationCode: category,
      romanNumeral: romanNumeral.trim(),
      watermarkUrl: watermarkUrl.trim(),
      colorHex: colorHex || rgbToHex(colorRgb.r, colorRgb.g, colorRgb.b),
      colorRgb,
      gradeRequirement: gradeRequirement.trim() || 'Без ограничений',
      location: location.trim() || 'Район Города',
      threatRating,
      rewardAhn: Number(rewardAhn) || 0,
      rewardBonus: rewardBonus.trim(),
      objective: objective.trim(),
      background: background.trim(),
      threats: threats.length > 0 ? threats : ['Стандартные условия'],
      details: details.trim(),
      tacticalNotes: tacticalNotes.length > 0 ? tacticalNotes : [],
      status: 'available',
      updatedAt: Date.now(),
    };

    onAddOrder(newOrder);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-[#12141a] border border-amber-900/50 rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative text-stone-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          aria-label="Закрыть окно"
          className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-xl bg-stone-900/90 hover:bg-red-950/80 border border-stone-800 hover:border-red-600/50 text-stone-400 hover:text-red-300 transition-all shadow-md cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-stone-100">
                Конструктор Листов Заказа
              </h2>
              <p className="text-xs text-stone-400 font-mono-code">
                Создание нового официального заказа в реестре
              </p>
            </div>
          </div>

          {/* Slots badge & Reset Form button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-300 text-xs font-mono flex items-center gap-1.5 border border-stone-800 transition-colors cursor-pointer"
              title="Очистить все поля формы"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Очистить форму</span>
            </button>

            <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
              <span className="text-xs font-mono text-stone-400">Слоты:</span>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  isLimitReached
                    ? 'bg-red-950 text-red-300 border border-red-500/40'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {currentCount} / {MAX_ORDERS_COUNT}
              </span>
            </div>
          </div>
        </div>

        {isLimitReached && (
          <div className="p-3.5 mb-5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Достигнут максимальный лимит в {MAX_ORDERS_COUNT} заказов!</strong>
              <p className="text-red-300/80 mt-0.5">
                Чтобы создать новый лист, удалите один из существующих заказов на доске.
              </p>
            </div>
          </div>
        )}

        {/* MAIN CONSTRUCTOR FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 font-mono">
              Тип Заказчика
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setCategory('association')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  category === 'association'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
                }`}
              >
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Ассоциация</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('syndicate')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  category === 'syndicate'
                    ? 'bg-red-950/60 border-red-500 text-red-200 shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
                }`}
              >
                <Users2 className="w-4 h-4 text-red-400" />
                <span>Синдикат</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('office')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  category === 'office'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
                }`}
              >
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Офис</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('individual')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  category === 'individual'
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
                }`}
              >
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Индивидуальный</span>
              </button>
            </div>
          </div>

          {/* Color Selector with RGB System */}
          <RgbColorSelector
            color={colorRgb}
            onChange={(newRgb, newHex) => {
              setColorRgb(newRgb);
              setColorHex(newHex);
            }}
          />

          {/* Title & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Название заказа *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Введите название заказа"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-serif-header"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 flex items-center justify-between font-mono">
                <span>Код дела</span>
                <button
                  type="button"
                  onClick={() => setCode(generateRandomCode(category))}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5 lowercase font-normal"
                >
                  <Shuffle className="w-2.5 h-2.5" />
                  автокод
                </button>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Введите код заказа (необязательно)"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono-code text-stone-300 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Client & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Заказчик (Наименование) *
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => {
                  setClient(e.target.value);
                  if (!associationName) setAssociationName(e.target.value);
                }}
                required
                placeholder="Введите наименование заказчика"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Профиль деятельности заказчика
              </label>
              <input
                type="text"
                value={associationRole}
                onChange={(e) => setAssociationRole(e.target.value)}
                placeholder="Введите профиль деятельности заказчика"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-300 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Watermark Section (Image via URL and Roman Numeral / Symbol) */}
          <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                <span>Водяной знак бланка:</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Иконка по URL или символ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-stone-400 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-stone-500" />
                  <span>Ссылка на изображение водяного знака (URL):</span>
                </label>
                <input
                  type="url"
                  value={watermarkUrl}
                  onChange={(e) => setWatermarkUrl(e.target.value)}
                  placeholder="https://example.com/watermark.png"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">
                  Текстовый символ / Римская цифра:
                </label>
                <input
                  type="text"
                  value={romanNumeral}
                  onChange={(e) => setRomanNumeral(e.target.value)}
                  placeholder="I, II, IX, Ω..."
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs font-cinzel text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Live watermark image preview */}
            {watermarkUrl.trim() && (
              <div className="flex items-center gap-3 p-2 bg-stone-900 rounded-lg border border-stone-800 text-xs">
                <img
                  src={watermarkUrl}
                  alt="Водяной знак"
                  className="w-8 h-8 object-contain rounded bg-stone-950 border border-stone-700"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-[11px] font-mono text-stone-400 truncate flex-1">
                  Предпросмотр водяного знака загружен
                </span>
                <button
                  type="button"
                  onClick={() => setWatermarkUrl('')}
                  className="text-stone-500 hover:text-red-400 text-xs font-mono"
                >
                  Удалить
                </button>
              </div>
            )}
          </div>

          {/* Location & Grade & Threat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Локация
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Укажите локацию"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Требуемый ранг / квалификация
              </label>
              <input
                type="text"
                value={gradeRequirement}
                onChange={(e) => setGradeRequirement(e.target.value)}
                placeholder="Укажите требования к исполнителю"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Уровень угрозы
              </label>
              <select
                value={threatRating}
                onChange={(e) => setThreatRating(e.target.value)}
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
          </div>

          {/* РАЗГРАНИЧЕНИЕ ВОЗНАГРАЖДЕНИЯ В КОНСТРУКТОРЕ */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider font-mono">
                Разграничение вознаграждения
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                Итого: {typeof rewardAhn === 'number' && rewardAhn > 0 ? `${rewardAhn.toLocaleString('ru-RU')} Ан` : '0 Ан'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                  1. Базовое вознаграждение в Ан (Ahn) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={rewardAhn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRewardAhn(val === '' ? '' : Number(val));
                  }}
                  required
                  placeholder="0"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-amber-300 font-mono-code font-bold placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-mono text-stone-500">Быстро:</span>
                  {[50000, 100000, 250000, 500000, 1000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRewardAhn(amt)}
                      className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-[10px] font-mono text-amber-200/90 border border-stone-800 hover:border-amber-500/50 transition-colors cursor-pointer"
                    >
                      {amt.toLocaleString('ru-RU')} Ан
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                  2. Дополнительный бонус (Опционально)
                </label>
                <input
                  type="text"
                  value={rewardBonus}
                  onChange={(e) => setRewardBonus(e.target.value)}
                  placeholder="Укажите дополнительный бонус (необязательно)"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-stone-500 font-mono mt-1 block">
                  Если оставить пустым — блок бонуса не будет отображаться в заказе
                </span>
              </div>
            </div>
          </div>

          {/* Objective & Background */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
              Цель операции *
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              required
              placeholder="Опишите цель заказа"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
              Бэкграунд и предыстория *
            </label>
            <textarea
              rows={3}
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              required
              placeholder="Опишите предысторию и контекст"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Threats (Dynamic list) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider font-mono">
              Условия и угрозы:
            </label>
            {threats.length > 0 && (
              <div className="space-y-1.5">
                {threats.map((threat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-red-950/20 border border-red-900/40 text-xs text-red-200"
                  >
                    <span className="flex-1 mr-2">{threat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveThreat(idx)}
                      className="text-stone-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newThreatInput}
                onChange={(e) => setNewThreatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddThreat();
                  }
                }}
                placeholder="Укажите условие или угрозу"
                className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddThreat}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-colors cursor-pointer flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </div>
          </div>

          {/* Details (without 'регламент') */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
              Подробности выполнения
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Укажите подробности выполнения"
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* NEW DEDICATED FIELD: Особые предписания и директивы */}
          <div className="space-y-2 p-3.5 rounded-xl bg-stone-950/70 border border-stone-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider font-mono">
                Особые предписания и директивы:
              </label>
              <span className="text-[10px] text-stone-500 font-mono">
                {tacticalNotes.length} директив(ы)
              </span>
            </div>

            {tacticalNotes.length > 0 && (
              <div className="space-y-1.5">
                {tacticalNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300 font-mono-code"
                  >
                    <span className="flex-1 mr-2">• {note}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDirective(idx)}
                      className="text-stone-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newDirectiveInput}
                onChange={(e) => setNewDirectiveInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDirective();
                  }
                }}
                placeholder="Укажите особое предписание или директиву"
                className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddDirective}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold"
              >
                + Добавить директиву
              </button>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3 py-2 rounded-xl text-stone-400 hover:text-amber-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить всё</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLimitReached}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Создать бланк заказа</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
