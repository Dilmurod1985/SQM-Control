import { NextResponse } from 'next/server'
import createAuditSchema from '../../../zod/schemas/audit'
import { getSupabaseServerClient } from '../../../lib/supabaseClient'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createAuditSchema.parse(body)

    const supabase = getSupabaseServerClient()

    // Вставляем аудит
    const { data: auditData, error: auditError } = await supabase
      .from('audits')
      .insert([{ 
        template_id: parsed.template_id || null,
        department_id: parsed.department_id || null,
        workshop_id: parsed.workshop_id || null,
        shift_id: parsed.shift_id || null,
        performed_by: parsed.performed_by || null,
        performed_at: parsed.performed_at || null,
        notes: parsed.notes || null,
        attachments: parsed.attachments || null
      }])
      .select('id')
      .single()

    if (auditError) {
      console.error('Insert audit error', auditError)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    const auditId = (auditData as any).id

    // Вставляем audit_results
    const resultsToInsert = parsed.results.map((r: any) => ({
      audit_id: auditId,
      item_id: r.item_id,
      item_title: r.item_title,
      status: r.status || null,
      score: r.score ?? null,
      comment: r.comment ?? null,
      photo: r.photo_key ? { key: r.photo_key } : null,
      recorded_by: parsed.performed_by || null
    }))

    const { error: resError } = await supabase.from('audit_results').insert(resultsToInsert)
    if (resError) {
      console.error('Insert audit_results error', resError)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // Запись в audit_log
    await supabase.from('audit_log').insert([{ actor_id: parsed.performed_by || null, action: 'create_audit', object_type: 'audits', object_id: auditId, changes: parsed }])

    return NextResponse.json({ id: auditId })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Invalid payload' }, { status: 400 })
  }
}
