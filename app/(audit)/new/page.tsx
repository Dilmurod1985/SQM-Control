import React from 'react'
import AuditForm from '../../../components/audit/AuditForm'
import { AuditTemplateItem } from '../../../db/types'
import { cookies } from 'next/headers'

// Для MVP: простой page с примерным шаблоном (18 пунктов с заглушками)
const sampleItems: AuditTemplateItem[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `item-${i+1}`,
  title: `Пункт проверки ${i+1}`,
  description: `Описание пункта ${i+1}`,
  type: 'boolean',
  weight: 1,
  critical: i % 6 === 0
}))

export default function NewAuditPage() {
  // В реальном приложении берём профиль пользователя с сервера
  const userId = null

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Новый аудит</h1>
      <div className="max-w-3xl">
        <AuditForm templateItems={sampleItems} userId={userId ?? undefined} />
      </div>
    </div>
  )
}
