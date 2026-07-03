import React from 'react'
import { Profile } from '../../db/types'

type Props = { user?: Profile | null }

export default function Sidebar({ user }: Props) {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 hidden md:block">
      <div className="mb-6">
        <div className="text-lg font-semibold">SQM Control</div>
        <div className="text-xs text-slate-400">Sammix Quality Management</div>
      </div>

      <nav className="space-y-2">
        <a className="block px-3 py-2 rounded-md hover:bg-slate-800">Dashboard</a>
        <a className="block px-3 py-2 rounded-md hover:bg-slate-800">Аудиты</a>
        <a className="block px-3 py-2 rounded-md hover:bg-slate-800">ККТ</a>
        <a className="block px-3 py-2 rounded-md hover:bg-slate-800">Несоответствия</a>
        <a className="block px-3 py-2 rounded-md hover:bg-slate-800">Партии</a>
        <a className="block px-3 py-2 rounded-md hover:bg-slate-800">Документы</a>
      </nav>

      <div className="mt-6 text-xs text-slate-400">
        <div>Пользователь</div>
        <div className="mt-1 font-medium">{user?.full_name ?? 'Гость'}</div>
        <div className="text-slate-500">{user?.role ?? 'worker'}</div>
      </div>
    </aside>
  )
}
