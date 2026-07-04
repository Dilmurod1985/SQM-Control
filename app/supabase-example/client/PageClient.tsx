"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '../../../utils/supabase/client'

export default function PageClient() {
  const [todos, setTodos] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('todos').select('*').then(({ data }) => setTodos(data || []))
  }, [])

  return (
    <div className="p-4">
      <h3 className="font-medium mb-2">Supabase client example</h3>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>{t.name}</li>
        ))}
      </ul>
    </div>
  )
}
