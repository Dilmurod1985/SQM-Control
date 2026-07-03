import { NextResponse } from 'next/server'
import createNcSchema from '../../../zod/schemas/nc'
import { getSupabaseServerClient } from '../../../lib/supabaseClient'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createNcSchema.parse(body)
    const supabase = getSupabaseServerClient()

    const insertObj: any = {
      title: parsed.title,
      description: parsed.description || null,
      department_id: parsed.department_id || null,
      workshop_id: parsed.workshop_id || null,
      detected_by: parsed.detected_by || null,
      detected_at: parsed.detected_at || new Date().toISOString(),
      status: 'open',
      severity: parsed.severity || 'medium',
      photos: parsed.photos || null,
      related_audit: parsed.related_audit || null,
      assigned_to: parsed.assigned_to || null,
      due_date: parsed.due_date || null
    }

    const { data, error } = await supabase.from('non_conformities').insert([insertObj]).select('id').single()
    if (error) {
      console.error('Insert nc error', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    const ncId = (data as any).id

    // Создать уведомление для assigned_to
    if (parsed.assigned_to) {
      await supabase.from('notifications').insert([{ recipient_id: parsed.assigned_to, actor_id: parsed.detected_by || null, type: 'nc_assigned', payload: { ncId, title: parsed.title } }])
    }

    // audit_log
    await supabase.from('audit_log').insert([{ actor_id: parsed.detected_by || null, action: 'create_nc', object_type: 'non_conformities', object_id: ncId, changes: insertObj }])

    // Если критическое несоответствие — отправить Telegram через Edge Function
    if (parsed.severity === 'critical') {
      try {
        const edgeBase = process.env.SUPABASE_EDGE_FUNCTIONS_URL || process.env.SUPABASE_FUNCTIONS_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (edgeBase && serviceKey) {
          await fetch((edgeBase.replace(/\/$/, '') + '/telegramNotify'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` },
            body: JSON.stringify({ type: 'nc', ncId, department_id: parsed.department_id, workshop_id: parsed.workshop_id, title: parsed.title, message: `Критическое несоответствие: ${parsed.title}` })
          })
        }
      } catch (e) { console.error('telegram notify error', e) }
    }

    return NextResponse.json({ id: ncId })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Invalid payload' }, { status: 400 })
  }
}
