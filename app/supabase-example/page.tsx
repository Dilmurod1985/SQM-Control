import React from 'react'
import { createClient } from '../../utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select('*')

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-2">Supabase server example</h2>
      <ul>
        {(todos || []).map((t: any) => (
          <li key={t.id} className="py-1">{t.name}</li>
        ))}
      </ul>
    </div>
  )
}
