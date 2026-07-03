import { NextResponse } from 'next/server'
import createCcpSchema from '../../../zod/schemas/ccp'
import { getSupabaseServerClient } from '../../../lib/supabaseClient'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createCcpSchema.parse(body)
    const supabase = getSupabaseServerClient()

    let photoMeta = null
    if (parsed.photo_base64 && parsed.photo_name) {
      const bucket = 'ccp-photos'
      const key = `ccp/${Date.now()}_${parsed.photo_name}`
      const buffer = Buffer.from(parsed.photo_base64, 'base64')
      const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(key, buffer, { contentType: 'image/jpeg', upsert: false })
      if (uploadError) {
        console.error('Storage upload error', uploadError)
      } else {
        const pub = supabase.storage.from(bucket).getPublicUrl(key)
        const publicUrl = (pub as any)?.data?.publicUrl ?? null
        photoMeta = { key, url: publicUrl }
      }
    }

    const insertObj: any = {
      ccp_code: parsed.ccp_code,
      department_id: parsed.department_id || null,
      workshop_id: parsed.workshop_id || null,
      measured_by: parsed.measured_by || null,
      measured_at: parsed.measured_at || new Date().toISOString(),
      measurement_value: parsed.measurement_value ?? null,
      unit: parsed.unit || null,
      pass: parsed.pass ?? null,
      notes: parsed.notes || null,
      photo: photoMeta,
      location: parsed.location || null
    }

    const { error } = await supabase.from('ccp_monitoring').insert([insertObj])
    if (error) {
      console.error('Insert ccp_monitoring error', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    // notification / realtime can be published here
    await supabase.from('audit_log').insert([{ actor_id: parsed.measured_by || null, action: 'ccp_check_in', object_type: 'ccp_monitoring', object_id: parsed.ccp_code, changes: insertObj }])

    // Если контроль не пройден (pass === false) — уведомить через Telegram
    if (parsed.pass === false) {
      try {
        const edgeBase = process.env.SUPABASE_EDGE_FUNCTIONS_URL || process.env.SUPABASE_FUNCTIONS_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (edgeBase && serviceKey) {
          await fetch(edgeBase.replace(/\/$/, '') + '/telegramNotify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` },
            body: JSON.stringify({ type: 'ccp', ccpCode: parsed.ccp_code, department_id: parsed.department_id, workshop_id: parsed.workshop_id, message: `ККТ превышен: ${parsed.ccp_code}, значение ${parsed.measurement_value}${parsed.unit || ''}` })
          })
        }
      } catch (e) { console.error('telegram notify error', e) }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Invalid payload' }, { status: 400 })
  }
}
