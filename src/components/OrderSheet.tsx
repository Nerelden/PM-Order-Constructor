import React, { useState } from 'react';
import {
  ShieldAlert,
  Compass,
  AlertTriangle,
  Coins,
  MapPin,
  Target,
  FileText,
  Clock,
  Printer,
  Copy,
  Edit3,
  Check,
  CheckCircle2,
  PenTool,
  Maximize2,
  Minimize2,
  Trash2,
  Users2,
  Building2,
  Briefcase,
  UserCheck,
  Calendar,
  FileDown
} from 'lucide-react';
import { OrderContract, VisualTheme, getOrderRgb } from '../types';

interface OrderSheetProps {
  order: OrderContract;
  theme: VisualTheme;
  onSignClick: (order: OrderContract) => void;
  onEditClick: (order: OrderContract) => void;
  onDeleteClick?: (orderId: string) => void;
  onPrintClick?: (order: OrderContract) => void;
  onStatusChange: (orderId: string, newStatus: 'available' | 'in_progress' | 'completed') => void;
}

export const OrderSheet: React.FC<OrderSheetProps> = ({
  order,
  theme,
  onSignClick,
  onEditClick,
  onDeleteClick,
  onPrintClick,
  onStatusChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute dynamic RGB color
  const rgb = getOrderRgb(order);
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const rgbBgSoft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
  const rgbBorderSoft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
  const rgbBorderCard = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`;

  const hasBonus = Boolean(order.rewardBonus && order.rewardBonus.trim().length > 0);
  const hasDirectives = Boolean(order.tacticalNotes && order.tacticalNotes.length > 0);

  const getCategoryIcon = () => {
    if (order.watermarkUrl) {
      return (
        <img
          src={order.watermarkUrl}
          alt=""
          className="w-7 h-7 object-contain rounded"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    switch (order.clientCategory) {
      case 'syndicate':
        return <Users2 className="w-7 h-7" style={{ color: rgbString }} />;
      case 'office':
        return <Briefcase className="w-7 h-7" style={{ color: rgbString }} />;
      case 'individual':
        return <UserCheck className="w-7 h-7" style={{ color: rgbString }} />;
      case 'association':
      default:
        return order.associationCode === 'devyat' ? (
          <Compass className="w-7 h-7" style={{ color: rgbString }} />
        ) : (
          <ShieldAlert className="w-7 h-7" style={{ color: rgbString }} />
        );
    }
  };

  const getCategoryLabel = () => {
    switch (order.clientCategory) {
      case 'syndicate':
        return 'Синдикат';
      case 'office':
        return 'Офис Фиксеров';
      case 'individual':
        return 'Частный Заказчик';
      case 'association':
      default:
        return 'Ассоциация';
    }
  };

  const copyFullText = () => {
    const textToCopy = `ОФИЦИАЛЬНЫЙ ЛИСТ ЗАКАЗА [${order.code}]
${order.title}
Категория: ${getCategoryLabel()}
Заказчик: ${order.client}

Цель:
${order.objective}

Бэкграунд:
${order.background}

Условия и угрозы:
${order.threats.map((t) => `• ${t}`).join('\n')}

Подробности:
${order.details}
${hasDirectives ? `\nОсобые предписания и директивы:\n${order.tacticalNotes!.map((n) => `• ${n}`).join('\n')}` : ''}
Вознаграждение: ${order.rewardAhn.toLocaleString('ru-RU')} Ан${hasBonus ? ` (Бонус: ${order.rewardBonus})` : ''}
Статус: ${
      order.status === 'available'
        ? 'ДОСТУПЕН ДЛЯ ПРИНЯТИЯ'
        : order.status === 'in_progress'
        ? 'В РАБОТЕ'
        : 'ВЫПОЛНЕН'
    }
${order.assignedFixer ? `Исполнитель: ${order.assignedFixer} [${order.assignedOffice || ''}]` : ''}
${order.signedDate ? `Дата принятия заказа: ${order.signedDate}` : ''}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      style={{ borderColor: rgbBorderCard }}
      className={`order-sheet-card relative rounded-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between ${
        theme === 'parchment'
          ? 'parchment-bg text-stone-200 shadow-2xl border-2'
          : 'terminal-bg text-stone-100 shadow-xl border-2'
      } ${isExpanded ? 'ring-2 ring-amber-500/50' : ''}`}
    >
      {/* Dynamic Watermark: URL Image or Roman Numeral */}
      {order.watermarkUrl ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
          <img
            src={order.watermarkUrl}
            alt=""
            className="max-w-[280px] max-h-[280px] object-contain opacity-[0.08] filter grayscale contrast-125 select-none pointer-events-none"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      ) : order.romanNumeral ? (
        <div
          style={{ color: rgbString }}
          className="absolute -top-12 -right-8 text-[160px] font-cinzel font-black select-none pointer-events-none opacity-[0.04]"
        >
          {order.romanNumeral}
        </div>
      ) : null}

      {/* Top Header Tab */}
      <div className="relative z-10 border-b border-stone-800/80 bg-stone-950/70 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            style={{
              backgroundColor: rgbBgSoft,
              borderColor: rgbBorderSoft,
              color: rgbString,
            }}
            className="w-7 h-7 rounded-md flex items-center justify-center font-cinzel font-bold text-xs border"
          >
            {order.romanNumeral || order.code.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-code text-xs font-bold tracking-wider text-stone-200">
                {order.code}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-stone-800 text-stone-400">
                {getCategoryLabel()}
              </span>
            </div>
            <div className="text-[11px] text-stone-500 font-mono-code">
              АРХИВНЫЙ РЕГИСТР НАДЗОРА
            </div>
          </div>
        </div>

        {/* Status Pill & Action Icons */}
        <div className="flex items-center gap-2">
          <select
            value={order.status}
            onChange={(e) =>
              onStatusChange(order.id, e.target.value as 'available' | 'in_progress' | 'completed')
            }
            className={`text-xs font-mono font-bold px-2 py-1 rounded-md border cursor-pointer focus:outline-none transition-colors ${
              order.status === 'available'
                ? 'bg-stone-900 text-emerald-400 border-emerald-500/40'
                : order.status === 'in_progress'
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                : 'bg-blue-950/80 text-blue-300 border-blue-500/60'
            }`}
          >
            <option value="available">● ДОСТУПЕН</option>
            <option value="in_progress">▲ В РАБОТЕ</option>
            <option value="completed">✓ ВЫПОЛНЕН</option>
          </select>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            title={isExpanded ? 'Свернуть' : 'Фокус на листе'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onDeleteClick && (
            <button
              onClick={() => onDeleteClick(order.id)}
              className="p-1.5 rounded-md hover:bg-red-950/60 text-stone-500 hover:text-red-400 transition-colors"
              title="Удалить данный лист заказа"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Sheet Body */}
      <div className="relative z-10 p-5 sm:p-7 space-y-6 flex-1">
        {/* Official Header Crest with Title */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-800/80 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono-code text-stone-400">
              <span className="uppercase tracking-widest text-[11px]">
                ЛИСТ ОФИЦИАЛЬНОГО ЗАКАЗА
              </span>
              <span>•</span>
              <span className="text-stone-300">{order.location}</span>
            </div>
            <h2 className="font-serif-header text-xl sm:text-2xl font-bold tracking-tight text-stone-100 leading-snug">
              {order.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span
                style={{
                  backgroundColor: rgbBgSoft,
                  borderColor: rgbBorderSoft,
                  color: rgbString,
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded border font-semibold"
              >
                {order.associationName}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-stone-900 text-stone-300 border-stone-700">
                {order.gradeRequirement}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-stone-900 text-stone-400 border-stone-800">
                {order.threatRating}
              </span>
            </div>
          </div>

          {/* Insignia Stamp */}
          <div className="flex-shrink-0 self-start sm:self-auto">
            <div
              style={{
                backgroundColor: rgbBgSoft,
                borderColor: rgbBorderSoft,
              }}
              className="p-3 rounded-xl border flex items-center gap-2.5"
            >
              {getCategoryIcon()}
              <div className="font-mono-code text-[11px] leading-tight">
                <div className="font-bold tracking-wider truncate max-w-[140px] text-stone-200">
                  {order.associationName}
                </div>
                <div className="text-[9px] text-stone-400 uppercase">{getCategoryLabel()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: ЗАКАЗЧИК */}
        <div className="rounded-xl bg-stone-950/50 border border-stone-800/80 p-3.5 space-y-1">
          <div className="text-[11px] font-mono-code uppercase font-semibold text-stone-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-stone-400" />
            <span>Заказчик контракта:</span>
          </div>
          <div className="text-sm font-medium text-stone-200">
            {order.client}
          </div>
          {order.associationRole && (
            <div className="text-xs text-stone-400 font-mono-code">
              Профиль деятельности: {order.associationRole}
            </div>
          )}
        </div>

        {/* SECTION 2: ЦЕЛЬ */}
        <div className="rounded-xl bg-gradient-to-r from-stone-950 via-stone-900/60 to-stone-950 border border-stone-700/80 p-4 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-code uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Цель операции:
            </span>
            <span className="text-[10px] font-mono text-stone-400">ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ</span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-stone-100 leading-relaxed pl-1 border-l-2 border-amber-500/80">
            {order.objective}
          </p>
        </div>

        {/* SECTION 3: БЭКГРАУНД */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono-code uppercase font-semibold text-stone-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>Бэкграунд и разведывательные данные:</span>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950/40 border border-stone-800/80 text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
            {order.background}
          </div>
        </div>

        {/* SECTION 4: УСЛОВИЯ И УГРОЗЫ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-code uppercase font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Условия и угрозы:
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30">
              ПОВЫШЕННАЯ ОПАСНОСТЬ
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {order.threats.map((threat, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 flex items-start gap-3 text-xs sm:text-sm text-red-200/95"
              >
                <span className="w-5 h-5 rounded-full bg-red-900/60 text-red-300 flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 mt-0.5">
                  0{idx + 1}
                </span>
                <span className="leading-snug">{threat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: ПОДРОБНОСТИ (no 'регламент') */}
        {order.details && (
          <div className="rounded-xl bg-stone-950/60 border border-stone-800/80 p-3.5 space-y-1">
            <div className="text-[11px] font-mono-code uppercase font-semibold text-stone-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Подробности выполнения:</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {order.details}
            </p>
          </div>
        )}

        {/* SECTION 6: ОСОБЫЕ ПРЕДПИСАНИЯ И ДИРЕКТИВЫ */}
        {hasDirectives && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono-code uppercase font-semibold text-stone-400">
              Особые предписания и директивы:
            </div>
            <ul className="space-y-1 text-xs text-stone-400 font-mono-code pl-1">
              {order.tacticalNotes!.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-stone-500">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SECTION 7: ВОЗНАГРАЖДЕНИЕ (Bonus only rendered if specified) */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-stone-950 via-stone-900/80 to-stone-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="space-y-1">
            <div className="text-[11px] font-mono-code uppercase text-amber-300/80 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Официальное вознаграждение:</span>
            </div>
            <div className="font-cinzel text-xl sm:text-2xl font-black text-amber-300 tracking-wide">
              {order.rewardAhn.toLocaleString('ru-RU')}{' '}
              <span className="text-xs font-mono text-amber-400/80 font-normal">Ан (Ahn)</span>
            </div>
          </div>

          {/* Conditional Bonus block */}
          {hasBonus && (
            <div className="text-right sm:max-w-xs">
              <span className="text-[10px] font-mono text-stone-400 uppercase block">
                Дополнительные бонусы:
              </span>
              <span className="text-xs text-amber-200/90 font-medium leading-tight block">
                {order.rewardBonus}
              </span>
            </div>
          )}
        </div>

        {/* SECTION 8: STAMPS & ACCEPTANCE DATE */}
        <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4">
          {order.assignedFixer ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="rubber-stamp border-2 border-red-600 text-red-500 bg-red-950/20 font-cinzel text-xs">
                [ {order.stampText || 'ПРИНЯТО К ИСПОЛНЕНИЮ'} ]
              </div>
              <div className="text-xs font-mono-code space-y-0.5">
                <div className="text-stone-200 font-bold">
                  Исполнитель: {order.assignedFixer}
                </div>
                <div className="text-stone-400 text-[11px] flex items-center gap-2">
                  <span>Офис: {order.assignedOffice || 'Свободный фиксер'}</span>
                  {order.signedDate && (
                    <span className="flex items-center gap-1 text-amber-300 font-semibold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      Дата принятия: {order.signedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-stone-400 font-mono-code flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Лист открыт для регистрации фиксеров соответствующего ранга</span>
            </div>
          )}

          {/* Barcode & Verification */}
          <div className="flex items-center gap-2 text-stone-600 font-mono text-[10px] select-none">
            <span className="tracking-widest">||| | |||| || |||</span>
            <span>{order.code}</span>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="no-print relative z-10 border-t border-stone-800/90 bg-stone-950/80 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {order.status === 'available' ? (
            <button
              onClick={() => onSignClick(order)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-950/40 transition-all"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Принять заказ</span>
            </button>
          ) : order.status === 'in_progress' ? (
            <button
              onClick={() => onStatusChange(order.id, 'completed')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Завершить контракт</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 font-mono">
              <Check className="w-4 h-4" />
              <span>КОНТРАКТ ЗАКРЫТ И ОПЛАЧЕН</span>
            </div>
          )}

          <button
            onClick={() => onEditClick(order)}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs flex items-center gap-1 transition-colors"
            title="Редактировать параметры контракта"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Изменить</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyFullText}
            className="px-2.5 py-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs flex items-center gap-1 transition-colors"
            title="Скопировать официальный текст в буфер обмена"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Скопировано</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Копия</span>
              </>
            )}
          </button>

          {onPrintClick ? (
            <button
              onClick={() => onPrintClick(order)}
              className="px-2.5 py-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs flex items-center gap-1 transition-colors"
              title="Экспорт в PDF / Печать этого бланка"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          ) : (
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs flex items-center gap-1 transition-colors"
              title="Печать данного бланка"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
