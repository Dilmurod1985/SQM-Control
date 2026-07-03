import React, { useState } from 'react'
import { CreateCcpInput } from '../../zod/schemas/ccp'

type Props = {
  userId?: string | null
}

export default function CcpQuickCheck({ userId }: Props) {
  const [ccpCode, setCcpCode] = useState('')
  const [value, setValue] = useState<number | ''>('')
  const [unit, setUnit] = useState('°C')
  const [pass, setPass] = useState(true)
  const [notes, setNotes] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function captureLocation() {
    return new Promise<{ lat?: number; lng?: number; accuracy?: number }>((resolve) => {
      if (!navigator.geolocation) return resolve({})
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        () => resolve({})
      )
    })
  }

  async function toBase64(file: File) {
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const res = reader.result as string | null
        if (!res) return resolve(null)
        // strip data:*/*;base64,
        const idx = res.indexOf('base64,')
        resolve(idx >= 0 ? res.substring(idx + 7) : res)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const location = await captureLocation()
      let photo_base64: string | null = null
      let photo_name: string | null = null
      if (photoFile) {
        photo_base64 = await toBase64(photoFile)
        photo_name = photoFile.name
      }

      const payload: CreateCcpInput = {
        ccp_code: ccpCode,
        measured_by: userId ?? null,
        measured_at: new Date().toISOString(),
        measurement_value: value === '' ? null : Number(value),
        unit,
        pass,
        notes,
        photo_base64,
        photo_name,
        location
      }

      const res = await fetch('/api/ccp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Server error')
      alert('Отметка ККТ сохранена')
      // reset minimal
      setCcpCode('')
      setValue('')
      setPhotoFile(null)
    } catch (err) {
      console.error(err)
      alert('Ошибка при сохранении')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="p-4 bg-slate-800 rounded space-y-3">
      <div>
        <label className="text-sm text-slate-300">Код ККТ</label>
        <input value={ccpCode} onChange={(e) => setCcpCode(e.target.value)} className="w-full bg-slate-700 px-2 py-1 rounded" />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-sm text-slate-300">Значение</label>
          <input type="number" value={value as any} onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-700 px-2 py-1 rounded" />
        </div>
        <div className="w-28">
          <label className="text-sm text-slate-300">Ед.</label>
          <input value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-slate-700 px-2 py-1 rounded" />
        </div>
      </div>

      <div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={pass} onChange={(e) => setPass(e.target.checked)} />
          <span className="text-slate-300">Прошел</span>
        </label>
      </div>

      <div>
        <label className="text-sm text-slate-300">Фото</label>
        <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="w-full bg-slate-700 px-2 py-1 rounded" />
      </div>

      <div>
        <label className="text-sm text-slate-300">Примечания</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-slate-700 px-2 py-1 rounded" />
      </div>

      <div>
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 rounded">{submitting ? 'Сохранение...' : 'Отметить ККТ'}</button>
      </div>
    </form>
  )
}
