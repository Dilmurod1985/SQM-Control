import { NextRequest, NextResponse } from 'next/server'

type Payload = {
  chat_id?: number | string
  chat_ids?: Array<number | string>
  text?: string
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML'
  disable_web_page_preview?: boolean
}

async function sendMessage(botToken: string, chatId: number | string, payload: Omit<Payload, 'chat_id' | 'chat_ids'>) {
  const body = {
    chat_id: chatId,
    text: payload.text,
    parse_mode: payload.parse_mode || 'HTML',
    disable_web_page_preview: payload.disable_web_page_preview ?? false,
  }

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const json = await res.json().catch(() => ({ ok: false }))
  return { ok: res.ok, status: res.status, response: json }
}

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not set' }, { status: 500 })
    }

    const body = (await request.json()) as Payload
    const text = body.text?.toString() ?? ''
    if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })

    const recipients: Array<number | string> = []
    if (body.chat_ids && Array.isArray(body.chat_ids) && body.chat_ids.length > 0) {
      recipients.push(...body.chat_ids)
    }
    if (body.chat_id) recipients.push(body.chat_id)

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'chat_id or chat_ids required' }, { status: 400 })
    }

    const results = await Promise.all(
      recipients.map((c) => sendMessage(botToken, c, { text, parse_mode: body.parse_mode, disable_web_page_preview: body.disable_web_page_preview }))
    )

    return NextResponse.json({ success: true, results }, { status: 200 })
  } catch (err) {
    console.error('telegram notify error', err)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}

