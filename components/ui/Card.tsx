import React, { ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
  accent?: 'blue' | 'green' | 'red' | 'yellow'
}

const accentMap: Record<string,string> = {
  blue: 'ring-blue-500',
  green: 'ring-emerald-400',
  red: 'ring-rose-500',
  yellow: 'ring-amber-400'
}

export default function Card({ title, children, accent = 'blue' }: Props) {
  return (
    <div className={`bg-slate-800 p-4 rounded-lg ring-1 ring-slate-700 ${accentMap[accent]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  )
}
