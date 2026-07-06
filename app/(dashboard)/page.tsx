import React from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Topbar from '../../components/layout/Topbar'
import Card from '../../components/ui/Card'
import { Profile } from '../../db/types'
import PieCompliance from '../../components/charts/PieCompliance'
import LineTrend from '../../components/charts/LineTrend'
import BarTopNc from '../../components/charts/BarTopNc'
import DeptCards, { DeptItem } from '../../components/dept/DeptCards'
import ExportButton from '../../components/ui/ExportButton'
import { createClient } from '../../utils/supabase/server'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  const user = undefined as Profile | undefined | null
  const role = user?.role ?? 'worker'

  // Серверный Supabase клиент с cookie
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let auditsData: any[] = []
  try {
    const { data } = await supabase
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    auditsData = data || []
  } catch (e) {
    console.error('Supabase error:', e)
  }

  const auditsList = auditsData

  const compliancePercent = auditsList.length
    ? Math.round(
        auditsList.reduce((s, a) => s + (a.overall_score ?? 0), 0) / auditsList.length,
      )
    : 78 // fallback
  const trendData = [
    { date: '6 дней', value: 72 },
    { date: '5 дн', value: 74 },
    { date: '4 дн', value: 70 },
    { date: '3 дн', value: 75 },
    { date: '2 дн', value: 80 },
    { date: '1 дн', value: 77 },
    { date: 'Сегодня', value: compliancePercent }
  ]

  const topNcs = [
    { name: 'Гигиена', count: 12 },
    { name: 'Температура', count: 9 },
    { name: 'Оборудование', count: 7 },
    { name: 'Прослеживаемость', count: 5 },
    { name: 'Маркировка', count: 3 }
  ]

  const deptStatuses: DeptItem[] = [
    { id: 'd1', name: 'Цех убоя', status: 'green' as DeptItem['status'], open_nc: 1 },
    { id: 'd2', name: 'Цех переработки', status: 'yellow' as DeptItem['status'], open_nc: 4 },
    { id: 'd3', name: 'Цех фасовки', status: 'red' as DeptItem['status'], open_nc: 8 }
  ]

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} />

        <main className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card title="Соответствие" accent={compliancePercent >= 90 ? 'green' : compliancePercent >= 75 ? 'yellow' : 'red'}>
              <div className="h-48">
                <PieCompliance percent={compliancePercent} />
              </div>
            </Card>

            <Card title="Динамика за 7 дней" accent="blue">
              <div className="h-48">
                <LineTrend data={trendData} />
              </div>
            </Card>

            <Card title="Топ-5 несоответствий" accent="red">
              <div className="h-48">
                <BarTopNc data={topNcs} />
              </div>
            </Card>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <DeptCards items={deptStatuses} />
            <div className="p-3 bg-slate-800 rounded">
              <div className="font-medium mb-2">Отчёты</div>
              <div>
                <ExportButton type="audits" label="Скачать Excel отчёт" params={{ from: undefined, to: undefined }} />
              </div>
            </div>
            <Card title="Последние аудиты">
              <ul className="space-y-3">
                {auditsList.length === 0 && (
                  <li className="text-sm text-slate-400">Нет доступных аудитов (используется мок-данные)</li>
                )}
                {auditsList.slice(0, 5).map((a) => (
                  <li key={a.id ?? `${a.department}-${a.created_at}`} className="flex justify-between">
                    <div>
                      <div className="font-medium">{a.department ?? 'Аудит без названия'}</div>
                      <div className="text-xs text-slate-400">{a.department ?? ''} — {a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</div>
                    </div>
                    <div className={`${(a.overall_score ?? 0) >= 90 ? 'text-green-400' : (a.overall_score ?? 0) >=75 ? 'text-yellow-400' : 'text-red-400'} font-semibold`}>{a.overall_score ? `${a.overall_score}%` : '—'}</div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
