// Supabase Edge Function: telegramNotify
// Deploy with `supabase functions deploy telegramNotify` (TypeScript template)
import { serve } from 'std/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function sendTelegram(chatId: string, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  })
  return res.ok
}

serve(async (req) => {
  try {
    const body = await req.json()
    // body: { type: 'nc'|'ccp', ncId?, ccpCode?, department_id?, workshop_id?, title?, message? }
    const { type, ncId, ccpCode, department_id, workshop_id, title, message } = body

    // Get director
    const { data: directors } = await supabase.from('profiles').select('id').eq('role', 'director').limit(1)
    const directorId = directors?.[0]?.id

    // Get master for department/workshop
    let masterId: string | null = null
    if (department_id) {
      const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'master').eq('department_id', department_id).limit(1)
      masterId = masters?.[0]?.id ?? null
    }
    if (!masterId && workshop_id) {
      const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'master').eq('workshop_id', workshop_id).limit(1)
      masterId = masters?.[0]?.id ?? null
    }

    const userIds = [directorId, masterId].filter(Boolean)
    if (userIds.length === 0) return new Response(JSON.stringify({ ok: false, reason: 'no recipients' }), { status: 200 })

    const { data: chats } = await supabase.from('user_telegram').select('telegram_chat_id,user_id').in('user_id', userIds as any)

    const text = message || (type === 'nc' ? `Критическое несоответствие: ${title} (ID: ${ncId})` : `ККТ превышен: ${ccpCode}`)

    let sent = 0
    for (const c of chats || []) {
      const ok = await sendTelegram(c.telegram_chat_id, text)
      if (ok) sent++
    }

    return new Response(JSON.stringify({ ok: true, sent }), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 })
  }
})
