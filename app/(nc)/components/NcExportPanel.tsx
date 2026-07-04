"use client"

import React from 'react'
import ExportButton from '../../../components/ui/ExportButton'

export default function NcExportPanel() {
  const [from, setFrom] = React.useState<string | undefined>(undefined)
  const [to, setTo] = React.useState<string | undefined>(undefined)
  const [department, setDepartment] = React.useState<string | undefined>(undefined)

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
        <input type="text" value={department ?? ''} onChange={(e) => setDepartment(e.target.value || undefined)} placeholder="Department id" className="w-full bg-slate-700 px-2 py-1 rounded" />
      </div>

      <ExportButton type="nc" label="Скачать Excel" params={{ from, to, department_id: department }} />
    </div>
  )
}

