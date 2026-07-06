"use client"

import React, { useState, useEffect } from 'react'

type Audit = {
  id: string
  date: string
  department: string
  overall_score: number
  status: string
  notes: string
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAudits()
  }, [])

  async function fetchAudits() {
    const res = await fetch('/api/audits')
    const data = await res.json()
    setAudits(data || [])
    setLoading(false)
  }

  async function createAudit() {
    const newAudit = {
      department: 'Новый цех',
      overall_score: 85,
      status: 'completed',
      notes: 'Тестовый аудит'
    }

    const res = await fetch('/api/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAudit)
    })

    if (res.ok) fetchAudits()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Аудиты</h1>
      <button onClick={createAudit} className="mb-4 px-4 py-2 bg-green-600 rounded">
        + Новый аудит
      </button>

      {loading ? <p>Загрузка...</p> : (
        <table className="min-w-full bg-slate-800 rounded">
          <thead>
            <tr>
              <th className="p-2">Дата</th>
              <th className="p-2">Отдел</th>
              <th className="p-2">Оценка</th>
              <th className="p-2">Статус</th>
              <th className="p-2">Примечание</th>
            </tr>
          </thead>
          <tbody>
            {audits.map(a => (
              <tr key={a.id} className="border-t border-slate-700">
                <td className="p-2">{new Date(a.date).toLocaleDateString()}</td>
                <td className="p-2">{a.department}</td>
                <td className="p-2">{a.overall_score}%</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2">{a.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
