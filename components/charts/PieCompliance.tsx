import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

type Props = { percent: number }

const COLORS = ['#10b981', '#94a3b8']

export default function PieCompliance({ percent }: Props) {
  const data = [
    { name: 'Соответствует', value: percent },
    { name: 'Несоответствует', value: Math.max(0, 100 - percent) }
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270}>
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={idx === 0 ? COLORS[0] : COLORS[1]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => `${value}%`} />
      </PieChart>
    </ResponsiveContainer>
  )
}
