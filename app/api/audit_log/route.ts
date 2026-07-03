import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabaseClient'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') || '100')
    const since = url.searchParams.get('since')
    const supabase = getSupabaseServerClient()

    let query = supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(limit)
    if (since) query = query.gt('created_at', since)

    const { data, error } = await query
    if (error) {
      console.error('audit_log fetch error', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 400 })
  }
}
