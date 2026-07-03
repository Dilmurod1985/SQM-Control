import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import createNcSchema, { CreateNcInput } from '../../zod/schemas/nc'

type Props = {
  userId?: string | null
  onSaved?: (id: string) => void
}

export default function NcForm({ userId, onSaved }: Props) {
  const { register, handleSubmit } = useForm<CreateNcInput>({ resolver: zodResolver(createNcSchema) })
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(data: CreateNcInput) {
    setSubmitting(true)
    try {
      const payload = { ...data, detected_by: userId }
      const res = await fetch('/api/nc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Server error')
      const json = await res.json()
      onSaved?.(json.id)
    } catch (err) {
      console.error(err)
      alert('Ошибка создания несоответствия')
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 bg-slate-800 p-4 rounded">
      <div>
        <label className="text-sm text-slate-300">Заголовок</label>
        <input {...register('title')} className="w-full bg-slate-700 px-2 py-1 rounded" />
      </div>
      <div>
        <label className="text-sm text-slate-300">Описание</label>
        <textarea {...register('description')} className="w-full bg-slate-700 px-2 py-1 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input {...register('department_id')} placeholder="department_id" className="bg-slate-700 px-2 py-1 rounded" />
        <input {...register('workshop_id')} placeholder="workshop_id" className="bg-slate-700 px-2 py-1 rounded" />
      </div>
      <div>
        <label className="text-sm text-slate-300">Назначить</label>
        <input {...register('assigned_to')} placeholder="assigned_to (profile id)" className="w-full bg-slate-700 px-2 py-1 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={submitting} className="px-3 py-1 bg-blue-600 rounded">{submitting ? 'Создаётся...' : 'Создать NC'}</button>
      </div>
    </form>
  )
}
