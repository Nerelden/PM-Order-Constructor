import React from 'react';
import {
  ShieldAlert,
  Compass,
  AlertTriangle,
  MapPin,
  Edit3,
  CheckCircle2,
  PenTool,
  Trash2,
  Users2,
  Briefcase,
  UserCheck,
  XCircle,
  RotateCcw,
  ListChecks,
  Users,
  User,
  Maximize2
} from 'lucide-react';
import { OrderContract, VisualTheme, getOrderRgb } from '../types';
import { LOGO_HAN_PNG, LOGO_HAN_DATA_URL } from '../assets/logo';

interface OrderSheetProps {
  order: OrderContract;
  theme: VisualTheme;
  onOpenDetail: (order: OrderContract) => void;
  onSignClick: (order: OrderContract) => void;
  onEditClick: (order: OrderContract) => void;
  onDeleteClick?: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: 'available' | 'in_progress' | 'completed' | 'failed') => void;
  onUnarchive?: (orderId: string) => void;
  isReadOnly?: boolean;
}

export const OrderSheet: React.FC<OrderSheetProps> = ({
  order,
  theme,
  isReadOnly = false,
  onOpenDetail,
  onSignClick,
  onEditClick,
  onDeleteClick,
  onStatusChange,
  onUnarchive,
}) => {

  const rgb = getOrderRgb(order);
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const rgbBgSoft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`;
  const rgbBorderSoft = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
  const rgbBorderCard = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`;

  const isFailed = order.status === 'failed';
  const hasBonus = Boolean(order.rewardBonus && order.rewardBonus.trim().length > 0);
  const hasDirectives = Boolean(order.tacticalNotes && order.tacticalNotes.length > 0);
  const conditionsList = (order.conditions || []).filter((c) => c.trim().length > 0);
  const threatsList = (order.threats || []).filter((t) => t.trim().length > 0);
  const recipientLabel =
    order.rewardRecipient === 'operator'
      ? 'Только оператору'
      : order.rewardRecipient === 'all'
      ? 'Всем'
      : null;

  const getCategoryIcon = () => {
    if (order.watermarkUrl) {
      return (
        <img
          key={order.watermarkUrl}
          src={order.watermarkUrl}
          alt=""
          className="w-5 h-5 object-contain rounded"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    switch (order.clientCategory) {
      case 'syndicate':
        return <Users2 className="w-5 h-5" style={{ color: rgbString }} />;
      case 'office':
        return <Briefcase className="w-5 h-5" style={{ color: rgbString }} />;
      case 'individual':
        return <UserCheck className="w-5 h-5" style={{ color: rgbString }} />;
      case 'association':
      default:
        if (
          order.associationCode === 'hana' ||
          (order.client && (order.client.toLowerCase().includes('хан') || order.client.toLowerCase().includes('hana'))) ||
          (order.associationName && (order.associationName.toLowerCase().includes('хан') || order.associationName.toLowerCase().includes('hana')))
        ) {
          return (
            <img
              src={LOGO_HAN_PNG}
              alt="Хана"
              className="w-5 h-5 object-contain drop-shadow"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = LOGO_HAN_DATA_URL;
              }}
            />
          );
        }
        return order.associationCode === 'devyat' ? (
          <Compass className="w-5 h-5" style={{ color: rgbString }} />
        ) : (
          <ShieldAlert className="w-5 h-5" style={{ color: rgbString }} />
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

  return (
    <article
      onClick={() => onOpenDetail(order)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetail(order);
        }
      }}
      style={{ borderColor: isFailed ? '#dc2626' : rgbBorderCard }}
      className={`order-sheet-card card-appear relative rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-amber-950/30 overflow-hidden flex flex-col justify-between w-full cursor-pointer group ${
        theme === 'parchment'
          ? 'parchment-bg text-stone-200 shadow-xl border'
          : 'terminal-bg text-stone-100 shadow-xl border'
      } ${isFailed ? 'ring-1 ring-red-600/40' : ''}`}
    >
      {/* Dynamic Watermark */}
      {order.watermarkUrl ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
          <img
            key={order.watermarkUrl}
            src={order.watermarkUrl}
            alt=""
            className="max-w-[180px] max-h-[180px] object-contain opacity-[0.11] select-none pointer-events-none"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      ) : order.romanNumeral ? (
        <div
          style={{ color: rgbString }}
          className="absolute -top-8 -right-6 text-[125px] font-cinzel font-black select-none pointer-events-none opacity-[0.04]"
        >
          {order.romanNumeral}
        </div>
      ) : null}

      {/* OVERLAY WHEN STATUS IS FAILED */}
      {isFailed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-3 bg-black/35">
          <div className="border-2 border-dashed border-red-600 bg-red-950/90 text-red-500 px-5 py-2 rounded-lg font-cinzel font-black text-lg sm:text-xl tracking-[0.2em] uppercase rotate-[-7deg] shadow-2xl shadow-red-950 backdrop-blur-sm">
            [ ПРОВАЛЕНО ]
          </div>
        </div>
      )}

      {/* Top Header Tab */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 border-b border-stone-800/80 bg-stone-950/75 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 cursor-default"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono-code text-xs font-bold tracking-wider text-stone-100 truncate">
            {order.code}
          </span>
          <span className="text-[11px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 truncate">
            {getCategoryLabel()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <select
            value={order.status}
            disabled={isReadOnly}
            title={isReadOnly ? 'Гостевой режим: изменение статуса недоступно' : 'Изменить статус контракта'}
            onChange={(e) =>
              onStatusChange(
                order.id,
                e.target.value as 'available' | 'in_progress' | 'completed' | 'failed'
              )
            }
            className={`text-[11px] font-mono font-bold px-2 py-1 rounded-md border focus:outline-none transition-colors ${
              isReadOnly ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
            } ${
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

          {!isReadOnly && onDeleteClick && (
            <button
              type="button"
              onClick={() => onDeleteClick(order.id)}
              className="p-1.5 rounded-md hover:bg-red-950/60 text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Удалить данный лист заказа"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Compact Card Body */}
      <div
        className={`relative z-10 p-3.5 sm:p-4 space-y-2.5 flex-1 transition-all ${
          isFailed ? 'filter blur-[1.5px] grayscale-[70%] opacity-65 select-none' : ''
        }`}
      >
        {/* Location */}
        <div className="flex items-center justify-between gap-2 text-[11px] font-mono-code text-stone-400">
          <span className="text-stone-300 flex items-center gap-1 truncate min-w-0">
            <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
            <span className="truncate">{order.location}</span>
          </span>
          <span className="text-amber-400/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
            <Maximize2 className="w-3 h-3" />
            <span>Открыть</span>
          </span>
        </div>

        {/* Title (Mikodacs) */}
        <h2 className="font-serif-header text-base sm:text-[17px] font-bold text-stone-100 leading-snug line-clamp-2 break-words">
          {order.title}
        </h2>

        {/* Client, Grade & Threat Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            style={{
              backgroundColor: rgbBgSoft,
              borderColor: rgbBorderSoft,
              color: rgbString,
            }}
            className="text-[11px] font-mono px-2 py-0.5 rounded border font-semibold truncate max-w-[180px]"
          >
            {order.client}
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-stone-900 text-stone-200 border-stone-700 truncate max-w-[160px]">
            {order.gradeRequirement}
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border bg-stone-900 text-stone-300 border-stone-800 truncate max-w-[180px]">
            {order.threatRating}
          </span>
        </div>

        {/* Reward & Crest */}
        <div className="flex items-end justify-between gap-2 pt-0.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-stone-400 uppercase">Награда:</span>
              {recipientLabel && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded border ${
                    order.rewardRecipient === 'operator'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                      : 'bg-stone-900/90 text-stone-200 border-stone-700'
                  }`}
                >
                  {order.rewardRecipient === 'operator' ? (
                    <User className="w-2.5 h-2.5 text-amber-400" />
                  ) : (
                    <Users className="w-2.5 h-2.5 text-stone-400" />
                  )}
                  <span>{recipientLabel}</span>
                </span>
              )}
            </div>
            <div className="font-cinzel text-lg sm:text-xl font-black text-amber-300 tracking-wide leading-tight mt-0.5">
              {order.rewardAhn.toLocaleString('ru-RU')}{' '}
              <span className="text-xs font-mono font-normal text-amber-400/85">Ан</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: rgbBgSoft,
              borderColor: rgbBorderSoft,
            }}
            className="px-2 py-1 rounded-lg border flex items-center gap-1.5 shadow-inner flex-shrink-0"
            title={getCategoryLabel()}
          >
            {getCategoryIcon()}
          </div>
        </div>

        {/* Concise Objective Preview (max 2 lines so cards never stretch vertically) */}
        <p className="text-xs text-stone-300 leading-relaxed line-clamp-2 min-h-[2.3rem] pt-1 border-t border-stone-800/70">
          {order.objective ? (
            <>
              <span className="text-amber-400/90 font-semibold">Цель: </span>
              {order.objective}
            </>
          ) : (
            <span className="text-stone-500 italic">Нажмите, чтобы открыть полный лист заказа</span>
          )}
        </p>

        {/* Compact Meta Summary Chips */}
        {(conditionsList.length > 0 || threatsList.length > 0 || order.assignedFixer) && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            {conditionsList.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 border border-stone-700/80 text-amber-300">
                <ListChecks className="w-3 h-3" />
                <span>Условия: {conditionsList.length}</span>
              </span>
            )}
            {threatsList.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/60 border border-red-800/70 text-red-300">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>Угрозы: {threatsList.length}</span>
              </span>
            )}
            {order.assignedFixer && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-200 truncate max-w-[180px]">
                <PenTool className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">{order.assignedFixer}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="no-print relative z-10 border-t border-stone-800/90 bg-stone-950/80 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 cursor-default"
      >
        <div className="flex items-center gap-1.5">
          {isReadOnly ? (
            <span className="text-[11px] font-mono text-stone-300 bg-stone-900/90 px-2.5 py-1 rounded-md border border-stone-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Только чтение</span>
            </span>
          ) : (
            <>
              {order.status === 'available' ? (
                <button
                  type="button"
                  onClick={() => onSignClick(order)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-950/40 transition-all cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Принять</span>
                </button>
              ) : order.status === 'in_progress' ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onStatusChange(order.id, 'completed')}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Завершить</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onStatusChange(order.id, 'failed')}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/60 transition-all cursor-pointer"
                    title="Отметить как проваленный"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Провал</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  {onUnarchive && (
                    <button
                      type="button"
                      onClick={() => onUnarchive(order.id)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/40 transition-all cursor-pointer"
                      title="Вытащить контракт из архива в реестр"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Из архива</span>
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => onEditClick(order)}
                className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-800 text-xs flex items-center transition-colors cursor-pointer"
                title="Редактировать параметры контракта"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenDetail(order)}
            className="px-2.5 py-1.5 rounded-lg hover:bg-stone-800 text-amber-300 hover:text-amber-200 border border-stone-800 text-xs flex items-center gap-1 font-mono transition-colors cursor-pointer"
            title="Открыть полный лист заказа"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Открыть</span>
          </button>
        </div>
      </div>
    </article>
  );
};
