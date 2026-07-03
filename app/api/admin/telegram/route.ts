import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../../lib/supabaseClient'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_id, telegram_chat_id } = body
    if (!user_id || !telegram_chat_id) return NextResponse.json({ error: 'user_id and telegram_chat_id required' }, { status: 400 })

    const supabase = getSupabaseServerClient()
    // upsert into user_telegram
    const { error } = await supabase.from('user_telegram').upsert({ user_id, telegram_chat_id, created_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 })
  }
}
