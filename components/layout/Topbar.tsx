import React from 'react'
import { Profile } from '../../db/types'

type Props = { user?: Profile | null }

export default function Topbar({ user }: Props) {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button className="md:hidden px-2 py-1 bg-slate-800 rounded">☰</button>
        <div className="text-sm text-slate-300">Добро пожаловать, {user?.full_name ?? 'Гость'}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-slate-400">Роль: <span className="font-medium text-slate-200">{user?.role ?? 'worker'}</span></div>
        <button className="px-3 py-1 bg-slate-800 rounded">Профиль</button>
      </div>
    </header>
  )
}
