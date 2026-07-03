import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Forward to Supabase Edge Function if configured
    const edgeBase = process.env.SUPABASE_EDGE_FUNCTIONS_URL || process.env.SUPABASE_FUNCTIONS_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!edgeBase || !serviceKey) {
      return NextResponse.json({ error: 'Edge function URL or service key not configured' }, { status: 500 })
    }

    const resp = await fetch(edgeBase.replace(/\/$/, '') + '/telegramNotify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` },
      body: JSON.stringify(body)
    })

    const text = await resp.text()
    return new NextResponse(text, { status: resp.status, headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Invalid payload' }, { status: 400 })
  }
}
