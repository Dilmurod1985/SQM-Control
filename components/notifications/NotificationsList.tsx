import React, { useEffect, useState, useCallback } from 'react'
import { useRealtime } from '../../hooks/useRealtime'

type Notification = {
  id: string
  recipient_id: string
  actor_id?: string
  type?: string
  payload?: any
  read?: boolean
  created_at?: string
}

export default function NotificationsList({ userId }: { userId?: string | null }) {
  const [items, setItems] = useState<Notification[]>([])

  useEffect(() => {
    // initial fetch
    fetch('/api/notifications').then(r => r.json()).then(data => setItems(data || []))
  }, [])

  const handleEvent = useCallback((ev: any) => {
    if (ev.type === 'notification') {
      const payload = ev.payload
      if (payload.record?.recipient_id === userId) {
        setItems((s) => [payload.record, ...s])
      }
    }
  }, [userId])

  useRealtime(handleEvent)

  return (
    <div className="p-3 bg-slate-800 rounded">
      <h4 className="text-sm font-medium mb-2">Уведомления</h4>
      <ul className="space-y-2 text-sm">
        {items.map(i => (
          <li key={i.id} className="flex justify-between items-start">
            <div>
              <div className="font-medium">{i.type}</div>
              <div className="text-xs text-slate-400">{i.payload?.title || ''}</div>
            </div>
            <div className="text-xs text-slate-500">{new Date(i.created_at || '').toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
