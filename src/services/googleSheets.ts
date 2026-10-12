import { OrderContract } from '../types';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export const createAndExportOrdersSheet = async (
  accessToken: string,
  orders: OrderContract[]
): Promise<ExportResult> => {
  const dateStr = new Date().toLocaleDateString('ru-RU');
  const title = `Официальный Реестр Заказов Города (${orders.length} контрактов) - ${dateStr}`;

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Ошибка создания таблицы Google Sheets: ${createRes.status} ${errorText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl =
    sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'syndicate':
        return 'Синдикат';
      case 'office':
        return 'Офис Фиксеров';
      case 'individual':
        return 'Частный заказчик';
      case 'association':
      default:
        return 'Ассоциация';
    }
  };

  // 2. Prepare tabular data
  const rows = [
    ['АССОЦИАЦИЯ ХАНА // ЕДИНЫЙ РЕЕСТР ДОГОВОРОВ И ЛИСТОВ ЗАКАЗА ГОРОДА', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    [`Всего контрактов в реестре: ${orders.length} (Макс. лимит: 10) | Дата выгрузки: ${new Date().toLocaleString('ru-RU')}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    [],
    [
      'Номер дела (Код)',
      'Название контракта',
      'Категория заказчика',
      'Заказчик',
      'Профиль деятельности',
      'Класс допуска / Ранг',
      'Локация инцидента',
      'Уровень угрозы',
      'Вознаграждение (Ан)',
      'Цель операции',
      'Бэкграунд и разведданные',
      'Условия и боевые угрозы',
      'Подробности и предписания',
      'Текущий статус',
      'Исполнитель',
      'Дата принятия заказа'
    ],
    ...orders.map((order) => [
      order.code,
      order.title.replace(/[«»]/g, ''),
      getCategoryLabel(order.clientCategory),
      order.client,
      order.associationRole,
      order.gradeRequirement,
      order.location,
      order.threatRating,
      `${order.rewardAhn.toLocaleString('ru-RU')} Ан (+ ${order.rewardBonus})`,
      order.objective,
      order.background,
      order.threats.join('\n— '),
      order.details,
      order.status === 'available'
        ? 'ДОСТУПЕН ДЛЯ ПРИНЯТИЯ'
        : order.status === 'in_progress'
        ? 'В РАБОТЕ (ПРИНЯТ ФИКСЕРОМ)'
        : 'ВЫПОЛНЕН',
      order.assignedFixer ? `${order.assignedFixer} (${order.assignedOffice || 'Частный фиксер'})` : 'Не назначен',
      order.signedDate || 'Не принят'
    ]),
  ];

  // 3. Write rows to sheet
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'A1',
        majorDimension: 'ROWS',
        values: rows,
      }),
    }
  );

  if (!updateRes.ok) {
    const errorText = await updateRes.text();
    throw new Error(`Ошибка записи данных в таблицу: ${updateRes.status} ${errorText}`);
  }

  // 4. Batch update formatting
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                startRowIndex: 3,
                endRowIndex: 4,
                startColumnIndex: 0,
                endColumnIndex: 16,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.12, green: 0.14, blue: 0.18 },
                  textFormat: {
                    foregroundColor: { red: 0.95, green: 0.82, blue: 0.35 },
                    bold: true,
                    fontSize: 10,
                  },
                  wrapStrategy: 'WRAP',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,wrapStrategy)',
            },
          },
          {
            repeatCell: {
              range: {
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 16,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.08, green: 0.09, blue: 0.11 },
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                    bold: true,
                    fontSize: 12,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      }),
    });
  } catch (fmtError) {
    console.warn('Batch formatting warning:', fmtError);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
  };
};
