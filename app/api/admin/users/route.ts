import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../../lib/supabaseClient'

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.from('profiles').select('id, full_name, email, role, department_id, workshop_id')
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, role } = body
    if (!id || !role) return NextResponse.json({ error: 'id and role required' }, { status: 400 })
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 })
  }
}
