import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabaseClient'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // expected: { nc_id, title, description, created_by, assigned_to, due_date }
    const { nc_id, title, description, created_by, assigned_to, due_date } = body
    if (!nc_id || !title) return NextResponse.json({ error: 'nc_id and title required' }, { status: 400 })

    const supabase = getSupabaseServerClient()

    const insertObj: any = { nc_id, title, description: description || null, created_by: created_by || null, assigned_to: assigned_to || null, due_date: due_date || null }
    const { data, error } = await supabase.from('corrective_actions').insert([insertObj]).select('id').single()
    if (error) {
      console.error('Insert ca error', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    const caId = (data as any).id

    if (assigned_to) {
      await supabase.from('notifications').insert([{ recipient_id: assigned_to, actor_id: created_by || null, type: 'ca_assigned', payload: { caId, title } }])
    }

    await supabase.from('audit_log').insert([{ actor_id: created_by || null, action: 'create_ca', object_type: 'corrective_actions', object_id: caId, changes: insertObj }])

    return NextResponse.json({ id: caId })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Invalid payload' }, { status: 400 })
  }
}
