import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabaseClient'
import { exportAuditsXlsx, exportAuditsPdf, exportNcXlsx } from '../../../services/exports'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { format, type, from, to } = body
    // type: 'audits' | 'nc'
    if (!format || !type) return NextResponse.json({ error: 'format and type required' }, { status: 400 })

    if (type === 'audits') {
      if (format === 'xlsx') {
        const buffer = await exportAuditsXlsx({ from, to })
        return new Response(buffer, { status: 200, headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="audits_${Date.now()}.xlsx"` } })
      }
      if (format === 'pdf') {
        const buffer = await exportAuditsPdf({ from, to })
        return new Response(buffer, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="audits_${Date.now()}.pdf"` } })
      }
    }

    if (type === 'nc' && format === 'xlsx') {
      const buffer = await exportNcXlsx({ from, to })
      return new Response(buffer, { status: 200, headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="nc_${Date.now()}.xlsx"` } })
    }

    return NextResponse.json({ error: 'unsupported format/type' }, { status: 400 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 400 })
  }
}
