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
  Trash2,
  Users2,
  Building2,
  Briefcase,
  UserCheck,
  Calendar,
  FileDown,
  ChevronDown,
  ChevronUp,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { OrderContract, VisualTheme, getOrderRgb } from '../types';

interface OrderSheetProps {
  order: OrderContract;
  theme: VisualTheme;
  forceExpanded?: boolean;
  onSignClick: (order: OrderContract) => void;
  onEditClick: (order: OrderContract) => void;
  onDeleteClick?: (orderId: string) => void;
  onPrintClick?: (order: OrderContract) => void;
  onStatusChange: (orderId: string, newStatus: 'available' | 'in_progress' | 'completed' | 'failed') => void;
  onUnarchive?: (orderId: string) => void;
  onClearStamp?: (orderId: string) => void;
}

export const OrderSheet: React.FC<OrderSheetProps> = ({
  order,
  theme,
  forceExpanded,
  onSignClick,
  onEditClick,
  onDeleteClick,
  onPrintClick,
  onStatusChange,
  onUnarchive,
  onClearStamp,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpandedLocal, setIsExpandedLocal] = useState<boolean | null>(null);

  const isExpanded = isExpandedLocal !== null ? isExpandedLocal : (forceExpanded ?? false);

  // Compute dynamic RGB color
  const rgb = getOrderRgb(order);
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const rgbBgSoft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
  const rgbBorderSoft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
  const rgbBorderCard = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`;

  const isFailed = order.status === 'failed';
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
        if (
          order.associationCode === 'hana' ||
          (order.client && (order.client.toLowerCase().includes('хан') || order.client.toLowerCase().includes('hana'))) ||
          (order.associationName && (order.associationName.toLowerCase().includes('хан') || order.associationName.toLowerCase().includes('hana')))
        ) {
          return (
            <img
              src="/logo_han.png"
              alt="Хана"
              className="w-7 h-7 object-contain drop-shadow"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo_han.svg';
              }}
            />
          );
        }
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
        : order.status === 'completed'
        ? 'ВЫПОЛНЕН'
        : 'ПРОВАЛЕНО'
    }
${order.assignedFixer ? `Исполнитель: ${order.assignedFixer} [${order.assignedOffice || ''}]` : ''}
${order.signedDate ? `Дата принятия заказа: ${order.signedDate}` : ''}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      style={{ borderColor: isFailed ? '#dc2626' : rgbBorderCard }}
      className={`order-sheet-card relative rounded-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between ${
        theme === 'parchment'
          ? 'parchment-bg text-stone-200 shadow-2xl border-2'
          : 'terminal-bg text-stone-100 shadow-xl border-2'
      } ${isFailed ? 'ring-1 ring-red-600/40' : ''}`}
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

      {/* OVERLAY WHEN STATUS IS FAILED: BLUR AND CENTRAL RED STAMP */}
      {isFailed && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-4 bg-black/40">
          <div className="border-4 border-dashed border-red-600 bg-red-950/90 text-red-500 px-6 sm:px-10 py-3.5 sm:py-4 rounded-lg font-cinzel font-black text-2xl sm:text-3xl tracking-[0.25em] uppercase rotate-[-8deg] shadow-2xl shadow-red-950 backdrop-blur-md">
            [ ПРОВАЛЕНО ]
          </div>
        </div>
      )}

      {/* Top Header Tab (No separate first letter square) */}
      <div className="relative z-10 border-b border-stone-800/80 bg-stone-950/70 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-code text-xs font-bold tracking-wider text-stone-200">
                {order.code}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                {getCategoryLabel()}
              </span>
            </div>
            <div className="text-[11px] text-stone-500 font-mono-code">
              АРХИВНЫЙ РЕГИСТР НАДЗОРА
            </div>
          </div>
        </div>

        {/* Status Pill, Expand Toggle & Action Icons */}
        <div className="flex items-center gap-2">
          <select
            value={order.status}
            onChange={(e) =>
              onStatusChange(
                order.id,
                e.target.value as 'available' | 'in_progress' | 'completed' | 'failed'
              )
            }
            className={`text-xs font-mono font-bold px-2 py-1 rounded-md border cursor-pointer focus:outline-none transition-colors ${
              order.status === 'available'
                ? 'bg-stone-900 text-emerald-400 border-emerald-500/40'
                : order.status === 'in_progress'
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                : order.status === 'completed'
                ? 'bg-blue-950/80 text-blue-300 border-blue-500/60'
                : 'bg-red-950 text-red-300 border-red-500/60 font-black'
            }`}
          >
            <option value="available">● ДОСТУПЕН</option>
            <option value="in_progress">▲ В РАБОТЕ</option>
            <option value="completed">✓ ВЫПОЛНЕН</option>
            <option value="failed">✕ ПРОВАЛЕНО</option>
          </select>

          <button
            onClick={() => setIsExpandedLocal(!isExpanded)}
            className="p-1.5 rounded-md hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 text-xs font-mono cursor-pointer"
            title={isExpanded ? 'Свернуть подробности' : 'Развернуть подробности'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
          </button>

          {onDeleteClick && (
            <button
              onClick={() => onDeleteClick(order.id)}
              className="p-1.5 rounded-md hover:bg-red-950/60 text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
              title="Удалить данный лист заказа"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Sheet Body (Blurred if failed) */}
      <div
        className={`relative z-10 p-5 sm:p-6 space-y-4 flex-1 transition-all ${
          isFailed ? 'filter blur-[2px] grayscale-[75%] opacity-60 select-none' : ''
        }`}
      >
        {/* Compact Summary View: always visible */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-xs font-mono-code text-stone-400">
              <span className="uppercase tracking-widest text-[11px]">
                ЛИСТ ЗАКАЗА
              </span>
              <span>•</span>
              <span className="text-stone-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-500" />
                {order.location}
              </span>
            </div>
            <h2 className="font-serif-header text-lg sm:text-xl font-bold tracking-tight text-stone-100 leading-snug">
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
                {order.client}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-stone-900 text-stone-300 border-stone-700">
                {order.gradeRequirement}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-stone-900 text-stone-400 border-stone-800">
                {order.threatRating}
              </span>
            </div>
          </div>

          {/* Reward & Insignia Crest */}
          <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 flex-shrink-0">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono text-stone-400 uppercase block">
                Вознаграждение:
              </span>
              <span className="font-cinzel text-lg sm:text-xl font-black text-amber-300 tracking-wide">
                {order.rewardAhn.toLocaleString('ru-RU')}{' '}
                <span className="text-xs font-mono font-normal text-amber-400/80">Ан</span>
              </span>
            </div>

            <div
              style={{
                backgroundColor: rgbBgSoft,
                borderColor: rgbBorderSoft,
              }}
              className="px-2.5 py-1.5 rounded-xl border flex items-center gap-2 shadow-inner"
              title={getCategoryLabel()}
            >
              {getCategoryIcon()}
              <span className="font-mono-code text-[10px] uppercase font-bold tracking-wider text-stone-300">
                {getCategoryLabel()}
              </span>
            </div>
          </div>
        </div>

        {/* Collapsed quick glance toggle */}
        {!isExpanded && (
          <div className="flex items-center justify-between text-xs text-stone-400 font-mono-code pt-1">
            <div className="truncate max-w-[70%] text-stone-300">
              <span className="text-stone-500 font-bold">Цель: </span>
              {order.objective}
            </div>
            <button
              type="button"
              onClick={() => setIsExpandedLocal(true)}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold text-[11px] hover:underline cursor-pointer"
            >
              <span>Развернуть</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* EXPANDABLE IN-DEPTH OPERATIONAL DETAILS */}
        {isExpanded && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-200">
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

            {/* SECTION 5: ПОДРОБНОСТИ */}
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

            {/* SECTION 7: ВОЗНАГРАЖДЕНИЕ И БОНУС */}
            {hasBonus && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between text-xs">
                <span className="font-mono text-stone-400 uppercase">
                  Дополнительный бонус:
                </span>
                <span className="font-semibold text-amber-200">
                  {order.rewardBonus}
                </span>
              </div>
            )}

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
                  {onClearStamp && (
                    <button
                      type="button"
                      onClick={() => onClearStamp(order.id)}
                      className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-red-400 border border-stone-800 hover:border-red-900/60 text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      title="Снять штамп принятия и очистить назначенного исполнителя"
                    >
                      <RotateCcw className="w-3 h-3 text-red-400" />
                      <span>Снять штамп</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-stone-400 font-mono-code flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Лист открыт для регистрации фиксеров</span>
                </div>
              )}

              {/* Barcode & Verification */}
              <div className="flex items-center gap-2 text-stone-600 font-mono text-[10px] select-none">
                <span className="tracking-widest">||| | |||| || |||</span>
                <span>{order.code}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="no-print relative z-10 border-t border-stone-800/90 bg-stone-950/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5">
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
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onStatusChange(order.id, 'completed')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Завершить</span>
              </button>
              <button
                onClick={() => onStatusChange(order.id, 'failed')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/60 transition-all"
                title="Отметить как проваленный"
              >
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span>Провал</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`flex items-center gap-1.5 text-xs font-bold font-mono ${
                  order.status === 'completed' ? 'text-blue-400' : 'text-red-400'
                }`}
              >
                {order.status === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>{order.status === 'completed' ? 'ВЫПОЛНЕН' : 'ПРОВАЛЕН'}</span>
              </div>

              {onUnarchive && (
                <button
                  type="button"
                  onClick={() => onUnarchive(order.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer shadow-sm"
                  title="Вытащить контракт из архива в реестр: вернуть в статус «Доступен» без принятого статуса и без штампа"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Вытащить из архива</span>
                </button>
              )}
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
          {/* Quick toggle details */}
          <button
            onClick={() => setIsExpandedLocal(!isExpanded)}
            className="px-2 py-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs flex items-center gap-1 font-mono transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Свернуть</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Детали</span>
              </>
            )}
          </button>

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
