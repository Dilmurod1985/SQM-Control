'use client'
import React, { useEffect, useState } from 'react'

type Profile = { id: string; full_name: string; email: string; role: string; department_id?: string | null }

export default function AdminUsersPage() {
  const [items, setItems] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const json = await res.json()
    setItems(json || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  async function changeRole(id: string, role: string) {
    const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role }) })
    if (res.ok) fetchUsers()
    else alert('Ошибка изменения роли')
  }

  async function setTelegram(id: string) {
    const chat = prompt('Введите telegram chat id для пользователя')
    if (!chat) return
    const res = await fetch('/api/admin/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: id, telegram_chat_id: chat }) })
    if (res.ok) alert('Сохранено')
    else alert('Ошибка')
  }

  return (
    <div className="p-6 text-slate-100">
      <h2 className="text-xl font-semibold mb-4">Admin — Пользователи</h2>
      {loading ? <div>Загрузка...</div> : (
        <table className="min-w-full bg-slate-800 rounded">
          <thead>
            <tr className="text-left text-slate-300">
              <th className="p-2">Имя</th>
              <th className="p-2">Email</th>
              <th className="p-2">Роль</th>
              <th className="p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id} className="border-t border-slate-700">
                <td className="p-2">{u.full_name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select defaultValue={u.role} onChange={(e) => changeRole(u.id, e.target.value)} className="bg-slate-700 px-2 py-1 rounded">
                    <option value="director">director</option>
                    <option value="master">master</option>
                    <option value="auditor">auditor</option>
                    <option value="worker">worker</option>
                  </select>
                </td>
                <td className="p-2">
                  <button onClick={() => setTelegram(u.id)} className="px-3 py-1 bg-blue-600 rounded">Set Telegram</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
