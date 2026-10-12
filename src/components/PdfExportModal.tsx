import React, { useState, useRef } from 'react';
import { X, FileDown, Printer, CheckCircle, Loader2, AlertCircle, FileText, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OrderContract, VisualTheme, getOrderRgb } from '../types';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderContract[];
  theme: VisualTheme;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const printableContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ordersToExport =
    selectedOrderId === 'all'
      ? orders
      : orders.filter((o) => o.id === selectedOrderId);

  // Generate downloadable PDF
  const handleDownloadPdf = async () => {
    if (!printableContainerRef.current || ordersToExport.length === 0) return;
    setIsGenerating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const fileName =
      selectedOrderId === 'all'
        ? `Реестр_Контрактов_Города_${Date.now()}.pdf`
        : `Контракт_${ordersToExport[0]?.code || 'Заказ'}.pdf`;

    let clone: HTMLElement | null = null;

    try {
      const sourceElement = printableContainerRef.current;

      // Create an off-screen clone with exact dimensions
      clone = sourceElement.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '794px'; // Standard A4 width at 96 DPI
      clone.style.maxHeight = 'none';
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      clone.style.backgroundColor = '#12141a';
      clone.style.color = '#f3f4f6';

      // Sanitize external images to prevent canvas tainting
      const images = clone.querySelectorAll('img');
      images.forEach((img) => {
        img.crossOrigin = 'anonymous';
      });

      document.body.appendChild(clone);

      // Wait a tiny moment for clone to attach
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false, // critical: allowTaint: false prevents tainted canvas SecurityError
        logging: false,
        backgroundColor: '#12141a',
        windowWidth: 794,
        imageTimeout: 5000,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(fileName);
      setSuccessMsg(`PDF-файл «${fileName}» успешно сформирован и сохранён!`);
    } catch (err: any) {
      console.warn('PDF export error, falling back to clean PDF generation / printable file:', err);

      try {
        // Fallback: generate printable HTML
        downloadStandaloneHtml(fileName.replace('.pdf', '.html'));
        setSuccessMsg(`Файл для печати «${fileName.replace('.pdf', '.html')}» успешно загружен!`);
      } catch (fallbackErr: any) {
        setErrorMsg('Ошибка формирования файла: ' + (err?.message || 'Неизвестная ошибка'));
      }
    } finally {
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      setIsGenerating(false);
    }
  };

  // Helper: Download self-contained standalone HTML print sheet
  const downloadStandaloneHtml = (downloadName?: string) => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Официальные Контракты Города</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #111; margin: 20px; line-height: 1.5; }
    .header { border-bottom: 3px solid #b45309; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 20px; font-weight: 800; letter-spacing: 1px; color: #92400e; }
    .meta { font-size: 11px; color: #666; font-family: monospace; }
    .order-card { border: 2px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid; }
    .order-code { font-family: monospace; font-size: 12px; font-weight: bold; color: #b45309; }
    .order-title { font-size: 16px; font-weight: bold; margin: 6px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 10px; }
    .box { background: #f9f9f9; padding: 8px; border-radius: 4px; border: 1px solid #ddd; font-size: 12px; margin-top: 6px; }
    .label { font-weight: bold; font-size: 11px; color: #555; text-transform: uppercase; }
    .threats { color: #991b1b; }
    .stamp { display: inline-block; border: 2px dashed #b91c1c; color: #b91c1c; padding: 4px 10px; font-weight: bold; font-size: 11px; transform: rotate(-2deg); margin-top: 8px; }
    @media print { body { margin: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">ГОРОДСКОЙ АРХИВ КОНТРАКТОВ // РЕЕСТР НАДЗОРА</div>
      <div class="meta">Официальная печатная ведомость • Дата формирования: ${new Date().toLocaleString('ru-RU')}</div>
    </div>
    <div class="meta">Класс допуска: LVL 7+</div>
  </div>
  ${ordersToExport
    .map(
      (o) => `
    <div class="order-card">
      <div style="display:flex; justify-content:space-between;">
        <span class="order-code">${o.code} • ${o.client}</span>
        <span class="meta">${o.status === 'available' ? 'ДОСТУПЕН' : o.status === 'in_progress' ? 'В РАБОТЕ (' + (o.signedDate || 'Принят') + ')' : 'ВЫПОЛНЕН'}</span>
      </div>
      <div class="order-title">${o.title}</div>
      <div class="grid">
        <div><span class="label">Заказчик:</span> ${o.client}</div>
        <div><span class="label">Награда:</span> <strong>${o.rewardAhn.toLocaleString('ru-RU')} Ан</strong>${o.rewardBonus && o.rewardBonus.trim() ? ' (+ ' + o.rewardBonus + ')' : ''}</div>
        <div><span class="label">Локация:</span> ${o.location}</div>
        <div><span class="label">Угроза:</span> ${o.threatRating}</div>
      </div>
      <div class="box"><span class="label">Цель операции:</span><br>${o.objective}</div>
      <div class="box"><span class="label">Бэкграунд разведки:</span><br>${o.background}</div>
      <div class="box threats"><span class="label" style="color:#991b1b;">Условия и угрозы:</span><br>${o.threats.map((t) => '• ' + t).join('<br>')}</div>
      ${o.details ? `<div class="box"><span class="label">Подробности:</span><br>${o.details}</div>` : ''}
      ${o.tacticalNotes && o.tacticalNotes.length > 0 ? `<div class="box"><span class="label">Особые предписания и директивы:</span><br>${o.tacticalNotes.map((n) => '• ' + n).join('<br>')}</div>` : ''}
      ${
        o.assignedFixer
          ? `<div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
              <span class="stamp">[ ${o.stampText || 'ПРИНЯТО К ИСПОЛНЕНИЮ'} ]</span>
              <span class="meta">Исполнитель: <strong>${o.assignedFixer}</strong> [${o.assignedOffice || 'Частный фиксер'}] • Дата: <strong>${o.signedDate || 'Зафиксирована'}</strong></span>
            </div>`
          : ''
      }
    </div>
  `
    )
    .join('')}
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName || `Контракты_Города_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDirectPrint = () => {
    try {
      window.print();
    } catch {
      downloadStandaloneHtml();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-[#12141a] border border-amber-900/50 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative text-stone-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          aria-label="Закрыть окно"
          className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-xl bg-stone-900/90 hover:bg-red-950/80 border border-stone-800 hover:border-red-600/50 text-stone-400 hover:text-red-300 transition-all shadow-md cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-stone-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileDown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cinzel text-base sm:text-lg font-bold text-stone-100">
              Экспорт и Печать Заказов в PDF
            </h2>
            <p className="text-xs text-stone-400 font-mono-code">
              Генерация официальных бланков А4 для архива
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
                Что экспортировать в PDF:
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="all">Все заказы реестра ({orders.length} листов)</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.code} — {o.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isGenerating || ordersToExport.length === 0}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Формирование...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Скачать файл PDF (A4)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => downloadStandaloneHtml()}
                disabled={ordersToExport.length === 0}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-xl flex items-center gap-1.5 border border-stone-700 transition-colors"
                title="Скачать автономный HTML-документ с автопечатью"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">HTML-бланк</span>
              </button>

              <button
                onClick={handleDirectPrint}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-xl flex items-center gap-1.5 border border-stone-700 transition-colors"
                title="Открыть стандартный диалог печати"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Live Document Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-stone-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Предпросмотр печатной ведомости:
            </span>
            <span>{ordersToExport.length} документ(ов)</span>
          </div>

          <div className="border border-stone-800 rounded-xl p-4 bg-[#0a0c10] max-h-80 overflow-y-auto">
            {ordersToExport.length === 0 ? (
              <div className="p-8 text-center text-stone-500 font-mono text-xs">
                Нет заказов для печати. Создайте заказ в конструкторе.
              </div>
            ) : (
              <div
                ref={printableContainerRef}
                className="p-6 bg-[#12141a] text-stone-100 rounded-lg space-y-6 font-sans border border-amber-900/30"
              >
                {/* Official Header */}
                <div className="border-b-2 border-amber-600/60 pb-3 flex items-center justify-between">
                  <div>
                    <h1 className="font-cinzel text-base font-black tracking-wider text-amber-300">
                      ГОРОДСКОЙ АРХИВ КОНТРАКТОВ // РЕЕСТР НАДЗОРА
                    </h1>
                    <p className="text-[10px] font-mono text-stone-400">
                      ОФИЦИАЛЬНАЯ ПЕЧАТНАЯ ВЕДОМОСТЬ • ВЫГРУЖЕНО: {new Date().toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <div className="font-mono text-xs text-amber-400 font-bold border border-amber-500/40 px-2 py-0.5 rounded">
                    Lvl 7+
                  </div>
                </div>

                {/* Order Sheets */}
                <div className="space-y-6">
                  {ordersToExport.map((order) => {
                    const rgb = getOrderRgb(order);
                    const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                    const rgbBorder = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
                    const hasBonus = Boolean(order.rewardBonus && order.rewardBonus.trim().length > 0);

                    return (
                      <div
                        key={order.id}
                        style={{ borderColor: rgbBorder }}
                        className="p-4 rounded-xl border-2 bg-stone-900/80 space-y-3 relative overflow-hidden"
                      >
                        {/* Watermark in PDF if present */}
                        {order.watermarkUrl && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] overflow-hidden">
                            <img
                              src={order.watermarkUrl}
                              alt=""
                              className="max-w-[180px] max-h-[180px] object-contain"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between border-b border-stone-800 pb-2 relative z-10">
                          <div className="font-mono font-bold text-xs" style={{ color: rgbStr }}>
                            {order.code} • {order.client}
                          </div>
                          <div className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            order.status === 'failed'
                              ? 'bg-red-950 text-red-300 border border-red-600/50 font-bold'
                              : 'bg-stone-800 text-stone-300'
                          }`}>
                            {order.status === 'available'
                              ? 'ДОСТУПЕН'
                              : order.status === 'in_progress'
                              ? `В РАБОТЕ (${order.signedDate || 'Принят'})`
                              : order.status === 'completed'
                              ? 'ВЫПОЛНЕН'
                              : 'ПРОВАЛЕНО'}
                          </div>
                        </div>

                        <h2 className="font-serif-header text-sm sm:text-base font-bold text-stone-100 relative z-10">
                          {order.title}
                        </h2>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono relative z-10">
                          <div>
                            <span className="text-stone-500 block text-[10px]">ЗАКАЗЧИК:</span>
                            <span className="text-stone-200">{order.client}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px]">НАГРАДА:</span>
                            <span className="text-amber-300 font-bold">
                              {order.rewardAhn.toLocaleString('ru-RU')} Ан
                            </span>
                            {hasBonus && (
                              <span className="text-amber-200/80 text-[10px] block">
                                Бонус: {order.rewardBonus}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px]">ЛОКАЦИЯ:</span>
                            <span className="text-stone-200">{order.location}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px]">УГРОЗА:</span>
                            <span className="text-amber-400 font-semibold">{order.threatRating}</span>
                          </div>
                        </div>

                        <div className="text-xs space-y-1 relative z-10">
                          <span className="font-mono text-stone-400 text-[10px] block font-bold uppercase">
                            ЦЕЛЬ:
                          </span>
                          <p className="text-stone-200">{order.objective}</p>
                        </div>

                        <div className="text-xs space-y-1 relative z-10">
                          <span className="font-mono text-stone-400 text-[10px] block font-bold uppercase">
                            БЭКГРАУНД:
                          </span>
                          <p className="text-stone-300 text-[11px] leading-relaxed">
                            {order.background}
                          </p>
                        </div>

                        <div className="text-xs space-y-1 relative z-10">
                          <span className="font-mono text-red-400 text-[10px] block font-bold uppercase">
                            УГРОЗЫ И РИСКИ:
                          </span>
                          <ul className="list-disc pl-4 text-red-300/90 text-[11px] space-y-0.5">
                            {order.threats.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>

                        {order.tacticalNotes && order.tacticalNotes.length > 0 && (
                          <div className="text-xs space-y-1 relative z-10">
                            <span className="font-mono text-stone-400 text-[10px] block font-bold uppercase">
                              ОСОБЫЕ ПРЕДПИСАНИЯ И ДИРЕКТИВЫ:
                            </span>
                            <ul className="list-disc pl-4 text-stone-300 text-[11px] space-y-0.5 font-mono">
                              {order.tacticalNotes.map((n, i) => (
                                <li key={i}>{n}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {order.assignedFixer && (
                          <div className="border-t border-stone-800 pt-2 flex items-center justify-between text-xs font-mono relative z-10">
                            <span className="text-stone-400">
                              Исполнитель: <strong>{order.assignedFixer}</strong> [
                              {order.assignedOffice || 'Частный фиксер'}]
                            </span>
                            <span className="text-amber-300 font-bold">
                              Дата принятия: {order.signedDate || 'Не указана'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
