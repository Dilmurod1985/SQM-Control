"use client"

import React from 'react'

type Props = {
  type: 'audits' | 'nc'
  label?: string
  params?: { [k: string]: any }
}

export default function ExportButton(props: Props) {
  const { type, label } = props
  const [loading, setLoading] = React.useState(false)

  async function generate(format: 'xlsx' | 'pdf' = 'xlsx') {
    try {
      setLoading(true)
      const body: any = { type, format }
      if (props.params) Object.assign(body, { ...props.params })
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_${Date.now()}.${format === 'xlsx' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setLoading(false)
    } catch (e) {
      setLoading(false)
      console.error(e)
      alert('Не удалось скачать отчёт')
    }
  }

  return (
    <div className="flex gap-2">
      <button disabled={loading} onClick={() => generate('xlsx')} className="px-3 py-1 bg-slate-700 rounded">{loading ? 'Загрузка...' : `📊 ${label ?? 'Скачать Excel'}`}</button>
      <button disabled={loading} onClick={() => generate('pdf')} className="px-3 py-1 bg-slate-700 rounded">{loading ? 'Загрузка...' : '📄 PDF'}</button>
    </div>
  )
}
