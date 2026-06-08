'use client'
import { useEffect, useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

export function RevenueTrend({ data }: { data: { month: string; value: number }[] }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 640)
  }, [])

  const chartHeight = isMobile ? 250 : 300

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-4" style={{ height: chartHeight + 40 }}>
      <h3 className="mb-3 text-sm font-medium text-white/70">Revenue — Won (last 6 months)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart data={data} margin={{ left: 4, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: '#11233a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 12 }}
            formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Won']}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
          {/* Bars show monthly amount with a teal fill */}
          <Bar dataKey="value" name="Won SGD" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.85} />
          {/* Trend line in brand orange overlaid */}
          <Line type="monotone" dataKey="value" name="Trend" stroke="#ff914d" strokeWidth={2.5} dot={{ fill: '#ff914d', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#f93f58' }} legendType="none" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
