"use client"

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Item = { name: string; count: number }
type Props = { data: Item[] }

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#60a5fa', '#a78bfa']

export default function BarTopNc({ data }: Props) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="count" fill="#ef4444" barSize={14}>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
