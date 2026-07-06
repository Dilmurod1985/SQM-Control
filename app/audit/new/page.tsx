"use client"

import React, { useState } from 'react'

type AuditItem = {
  id: string
  title: string
  checked: boolean
  score: number
  notes: string
}

export default function NewAuditPage() {
  const [items, setItems] = useState<AuditItem[]>([
    { id: '1', title: 'Гигиена персонала', checked: false, score: 0, notes: '' },
    { id: '2', title: 'Температура хранения', checked: false, score: 0, notes: '' },
    { id: '3', title: 'Маркировка продукции', checked: false, score: 0, notes: '' },
  ])

  const [overallScore, setOverallScore] = useState(0)

  function toggleItem(id: string) {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  function updateScore(id: string, score: number) {
    setItems(items.map(item => 
      item.id === id ? { ...item, score } : item
    ))
    calculateOverall()
  }

  function calculateOverall() {
    const total = items.reduce((sum, item) => sum + item.score, 0)
    setOverallScore(Math.round(total / items.length))
  }

  async function saveAudit() {
    const res = await fetch('/api/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        department: 'Цех убоя',
        overall_score: overallScore,
        status: 'completed',
        notes: 'Аудит проведён'
      })
    })

    if (res.ok) alert('Аудит сохранён!')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Новый аудит</h1>

      <div className="bg-slate-800 p-6 rounded mb-6">
        <h2 className="text-xl mb-4">Общая оценка: {overallScore}%</h2>

        {items.map(item => (
          <div key={item.id} className="mb-4 p-4 bg-slate-700 rounded">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(item.id)}
                />
                <span>{item.title}</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={item.score}
                onChange={(e) => updateScore(item.id, parseInt(e.target.value) || 0)}
                className="w-20 bg-slate-600 p-1 rounded text-center"
              />
            </div>
            <textarea
              placeholder="Примечание"
              value={item.notes}
              onChange={(e) => {
                setItems(items.map(i => i.id === item.id ? { ...i, notes: e.target.value } : i))
              }}
              className="mt-2 w-full bg-slate-600 p-2 rounded"
            />
          </div>
        ))}
      </div>

      <button
        onClick={saveAudit}
        className="w-full py-3 bg-green-600 rounded text-lg font-medium"
      >
        Сохранить аудит
      </button>
    </div>
  )
}
