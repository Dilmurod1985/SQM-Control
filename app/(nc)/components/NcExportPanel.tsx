"use client"

import React from 'react'
import ExportButton from '../../../components/ui/ExportButton'

export default function NcExportPanel() {
  const [from, setFrom] = React.useState<string | undefined>(undefined)
  const [to, setTo] = React.useState<string | undefined>(undefined)
  const [department, setDepartment] = React.useState<string | undefined>(undefined)
  const [departments, setDepartments] = React.useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const cached = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('departments_cache') : null
    const ttl = 1000 * 60 * 5 // 5 min
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed?.ts && Date.now() - parsed.ts < ttl && Array.isArray(parsed.data)) {
          setDepartments(parsed.data)
          return
        }
      } catch {}
    }

    setLoading(true)
    fetch('/api/departments')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then((data) => {
        setDepartments(data || [])
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('departments_cache', JSON.stringify({ ts: Date.now(), data }))
          }
        } catch {}
      })
      .catch((e) => setError((e && e.message) || 'Ошибка'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-3 bg-slate-800 rounded">
      <div className="font-medium mb-2">Экспорт несоответствий</div>

      <div className="mb-2">
        <label className="block text-sm">From</label>
        <input type="date" value={from ?? ''} onChange={(e) => setFrom(e.target.value || undefined)} className="w-full bg-slate-700 px-2 py-1 rounded" />
      </div>

      <div className="mb-2">
        <label className="block text-sm">To</label>
        <input type="date" value={to ?? ''} onChange={(e) => setTo(e.target.value || undefined)} className="w-full bg-slate-700 px-2 py-1 rounded" />
      </div>

      <div className="mb-3">
        <label className="block text-sm">Department (optional)</label>
        {loading ? (
          <div className="text-sm">Загрузка...</div>
        ) : error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : (
          <select value={department ?? ''} onChange={(e) => setDepartment(e.target.value || undefined)} className="w-full bg-slate-700 px-2 py-1 rounded">
            <option value="">Все отделы</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
      </div>

      <ExportButton type="nc" label="Скачать Excel" params={{ from, to, department_id: department }} />
    </div>
  )
}

