import React from 'react'

type Item = { id: string; name: string; status: 'green' | 'yellow' | 'red'; open_nc?: number }
type Props = { items: Item[] }

function StatusDot({ status }: { status: Item['status'] }) {
  const cls = status === 'green' ? 'bg-emerald-500' : status === 'yellow' ? 'bg-amber-400' : 'bg-rose-500'
  return <span className={`inline-block w-3 h-3 rounded-full ${cls}`} />
}

export default function DeptCards({ items }: Props) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="p-3 bg-slate-800 rounded flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <StatusDot status={it.status} />
              <div className="font-medium">{it.name}</div>
            </div>
            <div className="text-xs text-slate-400">Открытых NC: {it.open_nc ?? 0}</div>
          </div>
          <div>
            <button className="px-3 py-1 bg-slate-700 rounded">Перейти</button>
          </div>
        </div>
      ))}
    </div>
  )
}
