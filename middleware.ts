import { type NextRequest } from 'next/server'
import { createClient as createSupabaseResponse } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // createSupabaseResponse will produce a NextResponse with potential cookies set
  const resp = createSupabaseResponse(request)
  return resp
}

export const config = {
  // Limit middleware to API routes only to reduce overhead
  matcher: ['/api/:path*']
}
