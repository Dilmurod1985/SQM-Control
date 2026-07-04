"use client"

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import createAuditSchema, { CreateAuditInput } from '../../zod/schemas/audit'
import { AuditTemplateItem } from '../../db/types'

type Props = {
  templateItems: AuditTemplateItem[]
  onSaved?: (id: string) => void
  userId?: string
}

export default function AuditForm({ templateItems, onSaved, userId }: Props) {
  const router = useRouter()

  const { control, handleSubmit, register } = useForm<CreateAuditInput>({
    resolver: zodResolver(createAuditSchema),
    defaultValues: {
      results: templateItems.map((it) => ({ item_id: it.id, item_title: it.title }))
    }
  })

  async function onSubmit(data: CreateAuditInput) {
    try {
      // attach performed_by
      const payload = { ...data, performed_by: userId }
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Ошибка при сохранении')
      const json = await res.json()
      if (onSaved) {
        onSaved(json.id)
      } else {
        router.push(`/audit/${json.id}`)
      }
    } catch (e) {
      console.error(e)
      alert('Не удалось сохранить аудит')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-3">
        {templateItems.map((item, idx) => (
          <div key={item.id} className="p-3 bg-slate-800 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{idx + 1}. {item.title}</div>
              <div className="text-xs text-slate-400">{item.critical ? 'Крит.' : ''}</div>
            </div>
            <div className="flex gap-3">
              <Controller
                name={`results.${idx}.status` as any}
                control={control}
                render={({ field }) => (
                  <select {...field} className="bg-slate-700 px-2 py-1 rounded">
                    <option value="ok">OK</option>
                    <option value="minor">Minor</option>
                    <option value="major">Major</option>
                    <option value="critical">Critical</option>
                  </select>
                )}
              />

              <Controller
                name={`results.${idx}.score` as any}
                control={control}
                render={({ field }) => (
                  <input type="number" {...field} placeholder="Score" className="w-24 bg-slate-700 px-2 py-1 rounded" />
                )}
              />

              <input {...register(`results.${idx}.comment` as any)} placeholder="Комментарий" className="flex-1 bg-slate-700 px-2 py-1 rounded" />

              {/* Photo upload can be implemented to Storage — placeholder input */}
              <input type="file" accept="image/*" className="w-28 bg-slate-700 px-2 py-1 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="px-4 py-2 bg-blue-600 rounded">Сохранить аудит</button>
      </div>
    </form>
  )
}
