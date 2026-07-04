export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: NextRequest) {
  const update = await req.json();
  const chatId = update.message?.chat?.id;
  const text = update.message?.text;

  if (!chatId || !text) {
    return NextResponse.json({ ok: true });
  }

  let reply = "Привет! Я бот SQM Control.";

  if (text === '/start') {
    reply = "Добро пожаловать!\n\nКоманды:\n/status - статус\n/report - отчёт Excel\n/help - помощь";
  } else if (text === '/status') {
    reply = "✅ Система работает.\nТекущий статус: 82%";
  } else if (text === '/report') {
    // Генерация Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Аудиты');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Дата', key: 'date', width: 15 },
      { header: 'Отдел', key: 'dept', width: 20 },
      { header: 'Результат', key: 'result', width: 15 }
    ];

    sheet.addRows([
      { id: 1, date: '2026-07-04', dept: 'Цех убоя', result: '92%' },
      { id: 2, date: '2026-07-04', dept: 'Цех переработки', result: '78%' }
    ]);

    const buffer = await workbook.xlsx.writeBuffer();

    // Отправка файла
    const formData = new FormData();
    formData.append('chat_id', chatId.toString());
    formData.append('document', new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'audit_report.xlsx');
    formData.append('caption', 'Отчёт по аудиту');

    await fetch(`https://api.telegram.org/bot${TOKEN}/sendDocument`, {
      method: 'POST',
      body: formData
    });

    reply = "📊 Отчёт отправлен!";
  } else if (text === '/help') {
    reply = "Доступные команды:\n/start\n/status\n/report - Excel отчёт\n/help";
  }

  // Отправляем сопроводительное сообщение (опционально)
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: reply })
  });

  return NextResponse.json({ ok: true });
}
