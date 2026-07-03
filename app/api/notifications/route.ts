import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabaseClient'

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
    if (error) {
      console.error('Fetch notifications error', error)
      return NextResponse.json([], { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json([], { status: 500 })
  }
}
