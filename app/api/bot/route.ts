import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function POST(req: NextRequest) {
  const update = await req.json()

  const chatId = update.message?.chat?.id
  const text = update.message?.text

  if (!chatId || !text) {
    return NextResponse.json({ ok: true })
  }

  let reply = "Привет! Я бот SQM Control."

  if (text === '/start') {
    reply = "Добро пожаловать в SQM Control!\n\nКоманды:\n/status - статус качества\n/help - помощь"
  } else if (text === '/status') {
    reply = "✅ Система работает.\nТекущий статус: 78% (обновляется)"
  } else if (text === '/help') {
    reply = "Доступные команды:\n/start - приветствие\n/status - статус\n/help - эта помощь"
  }

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: reply,
    })
  })

  return NextResponse.json({ ok: true })
}
