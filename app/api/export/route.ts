import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabaseClient'
import { exportAuditsXlsx, exportAuditsPdf, exportNcXlsx } from '../../../services/exports'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let { format, type, from, to, department_id } = body ?? {}

    if (!format || !type) return NextResponse.json({ error: 'format and type required' }, { status: 400 })

    // normalize department_id
    if (department_id === null) department_id = undefined
    if (typeof department_id === 'string') department_id = department_id.trim() || undefined

    // validate format/type
    const allowedTypes = ['audits', 'nc']
    const allowedFormats = ['xlsx', 'pdf']
    if (!allowedTypes.includes(type)) return NextResponse.json({ error: 'unsupported type' }, { status: 400 })
    if (!allowedFormats.includes(format)) return NextResponse.json({ error: 'unsupported format' }, { status: 400 })

    // validate dates (optional) and enforce sensible range (max 2 years)
    const isValidDate = (v: any) => {
      if (!v) return false
      const d = Date.parse(v)
      return !Number.isNaN(d)
    }

    let fromIso: string | undefined = undefined
    let toIso: string | undefined = undefined
    if (from) {
      if (!isValidDate(from)) return NextResponse.json({ error: 'invalid from date' }, { status: 400 })
      fromIso = new Date(from).toISOString()
    }
    if (to) {
      if (!isValidDate(to)) return NextResponse.json({ error: 'invalid to date' }, { status: 400 })
      toIso = new Date(to).toISOString()
    }

    if (fromIso && toIso) {
      const diff = Math.abs(new Date(toIso).getTime() - new Date(fromIso).getTime())
      const maxRangeMs = 1000 * 60 * 60 * 24 * 365 * 2 // 2 years
      if (diff > maxRangeMs) return NextResponse.json({ error: 'date range too large (max 2 years)' }, { status: 400 })
      if (new Date(fromIso) > new Date(toIso)) return NextResponse.json({ error: 'from must be before to' }, { status: 400 })
    }

    // dispatch
    if (type === 'audits') {
      if (format === 'xlsx') {
        const buffer = await exportAuditsXlsx({ from: fromIso ?? null, to: toIso ?? null, department_id: department_id ?? null })
        return new Response(buffer, { status: 200, headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="audits_${Date.now()}.xlsx"` } })
      }
      if (format === 'pdf') {
        const buffer = await exportAuditsPdf({ from: fromIso ?? null, to: toIso ?? null, department_id: department_id ?? null })
        return new Response(buffer, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="audits_${Date.now()}.pdf"` } })
      }
    }

    if (type === 'nc' && format === 'xlsx') {
      const buffer = await exportNcXlsx({ from: fromIso ?? null, to: toIso ?? null, department_id: department_id ?? null })
      return new Response(buffer, { status: 200, headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="nc_${Date.now()}.xlsx"` } })
    }

    return NextResponse.json({ error: 'unsupported format/type' }, { status: 400 })
  } catch (err: any) {
    console.error('export route error', err)
    return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 })
  }
}
