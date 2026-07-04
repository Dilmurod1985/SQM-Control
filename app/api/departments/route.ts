import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabaseClient'

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.from('departments').select('id,name').order('name')
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error('Failed to load departments', err)
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 })
  }
}
