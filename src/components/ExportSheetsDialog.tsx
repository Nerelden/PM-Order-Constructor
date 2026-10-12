import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Loader2,
  X,
  ShieldCheck
} from 'lucide-react';
import { OrderContract } from '../types';
import { createAndExportOrdersSheet, ExportResult } from '../services/googleSheets';
import { getAccessToken, googleSignIn } from '../services/firebaseAuth';

interface ExportSheetsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderContract[];
  user: User | null;
  onAuthSuccess: (user: User, token: string) => void;
}

export const ExportSheetsDialog: React.FC<ExportSheetsDialogProps> = ({
  isOpen,
  onClose,
  orders,
  user,
  onAuthSuccess,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setError(null);
    setIsExporting(true);

    try {
      let token = await getAccessToken();

      // If user is not authenticated or token missing, trigger sign in
      if (!token) {
        const signResult = await googleSignIn();
        if (!signResult) {
          throw new Error('Авторизация отменена пользователем.');
        }
        token = signResult.accessToken;
        onAuthSuccess(signResult.user, signResult.accessToken);
      }

      const res = await createAndExportOrdersSheet(token, orders);
      setResult(res);
    } catch (err: any) {
      console.error('Export error:', err);
      setError(
        err.message || 'Произошла ошибка при экспорте данных в Google Таблицы.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const copyUrl = () => {
    if (result?.spreadsheetUrl) {
      navigator.clipboard.writeText(result.spreadsheetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12151b] border border-stone-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cinzel text-lg font-bold text-stone-100">
              Экспорт в Google Таблицы
            </h2>
            <p className="text-xs text-stone-400 font-mono-code">
              Синхронизация официальных листов заказа
            </p>
          </div>
        </div>

        {/* State 1: Success */}
        {result ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-200">
                  Таблица успешно создана в Google Таблицах!
                </h4>
                <p className="text-xs text-emerald-300/80 mt-1">
                  Данные по всем {orders.length} контрактам реестра записаны и отформатированы с заголовками, статусами и датами принятия.
                </p>
              </div>
            </div>

            <div className="bg-stone-900/90 rounded-xl p-3 border border-stone-800 text-xs flex items-center justify-between gap-2">
              <span className="font-mono text-stone-400 truncate max-w-xs">
                {result.spreadsheetUrl}
              </span>
              <button
                onClick={copyUrl}
                className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1 font-medium transition-colors"
                title="Скопировать ссылку"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Скопировано!' : 'Копия'}</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => {
                  setResult(null);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-medium"
              >
                Закрыть
              </button>
              <a
                href={result.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-colors"
              >
                <span>Открыть в Google Sheets</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* State 2: Confirmation / Action */
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs space-y-2 text-stone-300">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Параметры операции:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-stone-400">
                <li>
                  Будет создана новая таблица с названием: <strong className="text-stone-200">«Официальный Реестр Заказов Города ({orders.length} контрактов)»</strong>
                </li>
                <li>
                  Экспортируется <strong className="text-stone-200">{orders.length} официальных листов заказа</strong> со всеми графами (категория заказчика, цели, бэкграунд, угрозы/Stagger, вознаграждение, исполнители и даты принятия).
                </li>
                <li>
                  Применяется стилизация реестра Ассоциации Хана (темные шапки, выравнивание, цветовая дифференциация).
                </li>
              </ul>
            </div>

            {user && (
              <div className="text-xs text-stone-400 bg-stone-900/50 p-2.5 rounded-lg border border-stone-800/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>
                  Аккаунт для сохранения: <strong className="text-stone-200">{user.email}</strong>
                </span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                onClick={onClose}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Создание таблицы...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Подтвердить и экспортировать</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
