import React, { useEffect, useRef } from 'react';
import {
  X,
  ShieldAlert,
  Compass,
  AlertTriangle,
  MapPin,
  Target,
  FileText,
  Clock,
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
  XCircle,
  RotateCcw,
  ListChecks,
  Users,
  User
} from 'lucide-react';
import { OrderContract, VisualTheme, getOrderRgb } from '../types';
import { LOGO_HAN_PNG, LOGO_HAN_DATA_URL } from '../assets/logo';
import { useAnimatedVisibility } from '../hooks/useAnimatedVisibility';

interface OrderDetailModalProps {
  order: OrderContract | null;
  theme: VisualTheme;
  isOpen: boolean;
  hasNestedModalOpen?: boolean;
  isReadOnly?: boolean;
  onClose: () => void;
  onSignClick: (order: OrderContract) => void;
  onEditClick: (order: OrderContract) => void;
  onDeleteClick?: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: 'available' | 'in_progress' | 'completed' | 'failed') => void;
  onUnarchive?: (orderId: string) => void;
  onClearStamp?: (orderId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  theme,
  isOpen,
  hasNestedModalOpen = false,
  isReadOnly = false,
  onClose,
  onSignClick,
  onEditClick,
  onDeleteClick,
  onStatusChange,
  onUnarchive,
  onClearStamp,
}) => {
  const { shouldRender, isClosing } = useAnimatedVisibility(isOpen && !!order, 220);
  const cachedOrderRef = useRef<OrderContract | null>(order);
  if (order) cachedOrderRef.current = order;
  const activeOrder = order || cachedOrderRef.current;

  useEffect(() => {
    if (!isOpen || isClosing || hasNestedModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing, hasNestedModalOpen, onClose]);

  if (!shouldRender || !activeOrder) return null;

  const rgb = getOrderRgb(activeOrder);
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const rgbBgSoft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
  const rgbBorderSoft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
  const rgbBorderCard = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`;

  const isFailed = activeOrder.status === 'failed';
  const hasBonus = Boolean(activeOrder.rewardBonus && activeOrder.rewardBonus.trim().length > 0);
  const hasDirectives = Boolean(activeOrder.tacticalNotes && activeOrder.tacticalNotes.length > 0);
  const conditionsList = (activeOrder.conditions || []).filter((c) => c.trim().length > 0);
  const threatsList = (activeOrder.threats || []).filter((t) => t.trim().length > 0);
  const recipientLabel =
    activeOrder.rewardRecipient === 'operator'
      ? 'Только оператору'
      : activeOrder.rewardRecipient === 'all'
      ? 'Всем'
      : null;

  const getCategoryLabel = () => {
    switch (activeOrder.clientCategory) {
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

  const getCategoryIcon = () => {
    if (activeOrder.watermarkUrl) {
      return (
        <img
          key={activeOrder.watermarkUrl}
          src={activeOrder.watermarkUrl}
          alt=""
          className="w-6 h-6 object-contain rounded"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    switch (activeOrder.clientCategory) {
      case 'syndicate':
        return <Users2 className="w-6 h-6" style={{ color: rgbString }} />;
      case 'office':
        return <Briefcase className="w-6 h-6" style={{ color: rgbString }} />;
      case 'individual':
        return <UserCheck className="w-6 h-6" style={{ color: rgbString }} />;
      case 'association':
      default:
        if (
          activeOrder.associationCode === 'hana' ||
          (activeOrder.client && (activeOrder.client.toLowerCase().includes('хан') || activeOrder.client.toLowerCase().includes('hana'))) ||
          (activeOrder.associationName && (activeOrder.associationName.toLowerCase().includes('хан') || activeOrder.associationName.toLowerCase().includes('hana')))
        ) {
          return (
            <img
              src={LOGO_HAN_PNG}
              alt="Хана"
              className="w-6 h-6 object-contain drop-shadow"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = LOGO_HAN_DATA_URL;
              }}
            />
          );
        }
        return activeOrder.associationCode === 'devyat' ? (
          <Compass className="w-6 h-6" style={{ color: rgbString }} />
        ) : (
          <ShieldAlert className="w-6 h-6" style={{ color: rgbString }} />
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
      }`}
    >
      <div
        style={{ borderColor: isFailed ? '#dc2626' : rgbBorderCard }}
        className={`relative rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-2 ${
          theme === 'parchment' ? 'parchment-bg text-stone-200' : 'terminal-bg text-stone-100'
        } ${isClosing ? 'modal-panel-exit' : 'modal-panel'}`}
      >
        {/* Dynamic Watermark */}
        {activeOrder.watermarkUrl ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
            <img
              key={activeOrder.watermarkUrl}
              src={activeOrder.watermarkUrl}
              alt=""
              className="max-w-[260px] max-h-[260px] object-contain opacity-[0.11] select-none pointer-events-none"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        ) : activeOrder.romanNumeral ? (
          <div
            style={{ color: rgbString }}
            className="absolute -top-10 -right-6 text-[170px] font-cinzel font-black select-none pointer-events-none opacity-[0.04] z-0"
          >
            {activeOrder.romanNumeral}
          </div>
        ) : null}

        {/* Top Header */}
        <div className="relative z-10 border-b border-stone-800/90 bg-stone-950/80 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono-code text-xs sm:text-sm font-bold tracking-wider text-stone-100">
                {activeOrder.code}
              </span>
              <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                {getCategoryLabel()}
              </span>
              {isFailed && (
                <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-600/60 font-bold">
                  [ ПРОВАЛЕНО ]
                </span>
              )}
            </div>
            <div className="text-[11px] text-stone-400 font-mono-code mt-0.5">
              ПОЛНЫЙ ЛИСТ ОФИЦИАЛЬНОГО ЗАКАЗА
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={activeOrder.status}
              disabled={isReadOnly}
              title={isReadOnly ? 'Гостевой режим: изменение статуса недоступно' : 'Изменить статус контракта'}
              onChange={(e) =>
                onStatusChange(
                  activeOrder.id,
                  e.target.value as 'available' | 'in_progress' | 'completed' | 'failed'
                )
              }
              className={`text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none transition-colors ${
                isReadOnly ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
              } ${
                activeOrder.status === 'available'
                  ? 'bg-stone-900 text-emerald-400 border-emerald-500/40'
                  : activeOrder.status === 'in_progress'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                  : activeOrder.status === 'completed'
                  ? 'bg-blue-950/80 text-blue-300 border-blue-500/60'
                  : 'bg-red-950 text-red-300 border-red-500/60 font-black'
              }`}
            >
              <option value="available">● ДОСТУПЕН</option>
              <option value="in_progress">▲ В РАБОТЕ</option>
              <option value="completed">✓ ВЫПОЛНЕН</option>
              <option value="failed">✕ ПРОВАЛЕНО</option>
            </select>

            {!isReadOnly && onDeleteClick && (
              <button
                type="button"
                onClick={() => onDeleteClick(activeOrder.id)}
                className="p-2 rounded-lg hover:bg-red-950/60 text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Удалить данный лист заказа"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              type="button"
              aria-label="Закрыть окно"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-900/90 hover:bg-red-950/80 border border-stone-800 hover:border-red-600/50 text-stone-400 hover:text-red-300 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="relative z-10 p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title & Reward Header */}
          <div className="border-b border-stone-800/80 pb-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-code text-stone-400 flex-wrap">
              <span className="uppercase tracking-widest text-[11px]">ЛИСТ ЗАКАЗА</span>
              <span>•</span>
              <span className="text-stone-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                <span>{activeOrder.location}</span>
              </span>
            </div>

            <h2 className="font-serif-header text-xl sm:text-2xl font-bold text-stone-100 leading-snug break-words">
              {activeOrder.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <span
                style={{
                  backgroundColor: rgbBgSoft,
                  borderColor: rgbBorderSoft,
                  color: rgbString,
                }}
                className="text-xs font-mono px-2.5 py-1 rounded-md border font-semibold"
              >
                {activeOrder.client}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md border bg-stone-900 text-stone-200 border-stone-700">
                {activeOrder.gradeRequirement}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md border bg-stone-900 text-stone-300 border-stone-800">
                {activeOrder.threatRating}
              </span>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 pt-1">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-stone-400 uppercase">
                    Вознаграждение:
                  </span>
                  {recipientLabel && (
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-md border ${
                        activeOrder.rewardRecipient === 'operator'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                          : 'bg-stone-900/90 text-stone-200 border-stone-700'
                      }`}
                    >
                      {activeOrder.rewardRecipient === 'operator' ? (
                        <User className="w-3 h-3 text-amber-400" />
                      ) : (
                        <Users className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{recipientLabel}</span>
                    </span>
                  )}
                </div>
                <div className="font-cinzel text-2xl font-black text-amber-300 tracking-wide mt-0.5">
                  {activeOrder.rewardAhn.toLocaleString('ru-RU')}{' '}
                  <span className="text-sm font-mono font-normal text-amber-400/85">Ан</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: rgbBgSoft,
                  borderColor: rgbBorderSoft,
                }}
                className="px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-inner"
              >
                {getCategoryIcon()}
                <span className="font-mono-code text-xs uppercase font-bold tracking-wider text-stone-200">
                  {getCategoryLabel()}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 1: ЗАКАЗЧИК */}
          <div className="rounded-xl bg-stone-950/50 border border-stone-800/80 p-3.5 space-y-1">
            <div className="text-xs font-mono-code uppercase font-semibold text-stone-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-stone-400" />
              <span>Заказчик контракта:</span>
            </div>
            <div className="text-sm sm:text-base font-medium text-stone-100">
              {activeOrder.client}
            </div>
            {activeOrder.associationRole && (
              <div className="text-xs text-stone-400 font-mono-code">
                Профиль деятельности: {activeOrder.associationRole}
              </div>
            )}
          </div>

          {/* SECTION 2: ЦЕЛЬ */}
          {activeOrder.objective && (
            <div className="rounded-xl bg-gradient-to-r from-stone-950 via-stone-900/60 to-stone-950 border border-stone-700/80 p-4 space-y-2 shadow-inner">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-mono-code uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-400" />
                  Цель операции:
                </span>
                <span className="text-[11px] font-mono text-stone-400">ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ</span>
              </div>
              <p className="text-sm leading-relaxed font-semibold text-stone-100 pl-2.5 border-l-2 border-amber-500/80 whitespace-pre-line">
                {activeOrder.objective}
              </p>
            </div>
          )}

          {/* SECTION 3: БЭКГРАУНД */}
          {activeOrder.background && (
            <div className="space-y-2">
              <div className="text-xs font-mono-code uppercase font-semibold text-stone-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-stone-400" />
                <span>Бэкграунд и разведывательные данные:</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-950/40 border border-stone-800/80 text-sm text-stone-200 leading-relaxed whitespace-pre-line">
                {activeOrder.background}
              </div>
            </div>
          )}

          {/* SECTION 4A: УСЛОВИЯ */}
          {conditionsList.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono-code uppercase font-bold text-amber-300 flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-amber-400" />
                Условия контракта:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {conditionsList.map((cond, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-900/70 border border-stone-700/80 flex items-start gap-2.5 text-sm text-stone-100"
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-relaxed">{cond}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4B: УГРОЗЫ */}
          {threatsList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-mono-code uppercase font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Угрозы:
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/40">
                  ПОВЫШЕННАЯ ОПАСНОСТЬ
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {threatsList.map((threat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-red-950/30 border border-red-800/60 flex items-start gap-2.5 text-sm text-red-100"
                  >
                    <span className="w-6 h-6 rounded-full bg-red-900/70 text-red-300 border border-red-500/40 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-relaxed text-red-100">{threat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: ПОДРОБНОСТИ */}
          {activeOrder.details && (
            <div className="rounded-xl bg-stone-950/60 border border-stone-800/80 p-3.5 space-y-1.5">
              <div className="text-xs font-mono-code uppercase font-semibold text-stone-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-stone-400" />
                <span>Подробности выполнения:</span>
              </div>
              <p className="text-sm text-stone-200 leading-relaxed whitespace-pre-line">
                {activeOrder.details}
              </p>
            </div>
          )}

          {/* SECTION 6: ДИРЕКТИВЫ */}
          {hasDirectives && (
            <div className="space-y-2">
              <div className="text-xs font-mono-code uppercase font-semibold text-stone-400">
                Особые предписания и директивы:
              </div>
              <ul className="space-y-1.5 text-sm text-stone-300 font-mono-code pl-1">
                {activeOrder.tacticalNotes!.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-stone-500">•</span>
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION 7: БОНУС */}
          {hasBonus && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between text-xs sm:text-sm gap-2">
              <span className="font-mono text-stone-300 uppercase">
                Дополнительный бонус:
              </span>
              <span className="font-semibold text-amber-200">
                {activeOrder.rewardBonus}
              </span>
            </div>
          )}

          {/* SECTION 8: ШТАМП И ИСПОЛНИТЕЛЬ */}
          <div className="pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4">
            {activeOrder.assignedFixer ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="rubber-stamp border-2 border-red-600 text-red-500 bg-red-950/20 font-cinzel text-xs">
                  [ {activeOrder.stampText || 'ПРИНЯТО К ИСПОЛНЕНИЮ'} ]
                </div>
                <div className="text-xs sm:text-sm font-mono-code space-y-1">
                  <div className="text-stone-100 font-bold">
                    Исполнитель: {activeOrder.assignedFixer}
                  </div>
                  <div className="text-stone-400 text-xs flex items-center gap-2 flex-wrap">
                    <span>Офис: {activeOrder.assignedOffice || 'Свободный фиксер'}</span>
                    {activeOrder.signedDate && (
                      <span className="flex items-center gap-1 text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        Дата принятия: {activeOrder.signedDate}
                      </span>
                    )}
                  </div>
                </div>
                {!isReadOnly && onClearStamp && (
                  <button
                    type="button"
                    onClick={() => onClearStamp(activeOrder.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-red-400 border border-stone-800 hover:border-red-900/60 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Снять штамп принятия и очистить назначенного исполнителя"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                    <span>Снять штамп</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-stone-300 font-mono-code flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Лист открыт для регистрации фиксеров</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-stone-500 font-mono text-xs select-none">
              <span className="tracking-widest">||| | |||| || |||</span>
              <span>{activeOrder.code}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="relative z-10 border-t border-stone-800/90 bg-stone-950/90 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {isReadOnly ? (
              <span className="text-xs font-mono text-stone-300 bg-stone-900/90 px-3 py-1.5 rounded-lg border border-stone-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Режим чтения (Гость)</span>
              </span>
            ) : (
              <>
                {activeOrder.status === 'available' ? (
                  <button
                    type="button"
                    onClick={() => onSignClick(activeOrder)}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-950/40 transition-all cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Принять заказ</span>
                  </button>
                ) : activeOrder.status === 'in_progress' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onStatusChange(activeOrder.id, 'completed')}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Завершить</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(activeOrder.id, 'failed')}
                      className="px-3 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/60 transition-all cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>Провал</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className={`flex items-center gap-1.5 text-xs font-bold font-mono ${
                        activeOrder.status === 'completed' ? 'text-blue-400' : 'text-red-400'
                      }`}
                    >
                      {activeOrder.status === 'completed' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span>{activeOrder.status === 'completed' ? 'ВЫПОЛНЕН' : 'ПРОВАЛЕН'}</span>
                    </div>

                    {onUnarchive && (
                      <button
                        type="button"
                        onClick={() => onUnarchive(activeOrder.id)}
                        className="px-3 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Вытащить из архива</span>
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onEditClick(activeOrder)}
                  className="px-3 py-2 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-800 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Изменить</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
