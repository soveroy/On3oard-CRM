'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

// One distinctive colour per pipeline stage — fixed order matches DEFAULT_STAGES
const STAGE_COLORS: Record<string, string> = {
  'Lead':          '#6366f1', // indigo
  'Qualified':     '#3b82f6', // blue
  'Discovery':     '#06b6d4', // cyan
  'Proposal Sent': '#ff914d', // brand orange
  'Negotiation':   '#f59e0b', // amber
  'Won':           '#22c55e', // green
  'Lost':          '#f93f58', // brand red
}
const DEFAULT_COLOR = '#94a3b8'

export function PipelineBar({ data }: { data: { stage: string; count: number; value: number }[] }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 640)
  }, [])

  const fmt = (v: number) => `$${(v / 1000).toFixed(0)}k`
  const chartHeight = isMobile ? 250 : 300

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-4" style={{ height: chartHeight + 40 }}>
      <h3 className="mb-3 text-sm font-medium text-white/70">Pipeline by stage</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 48 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category" dataKey="stage" width={96}
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
            tickLine={false} axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{ background: '#11233a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 12 }}
            formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Value']}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
            <LabelList dataKey="value" position="right" style={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} formatter={(v: unknown) => fmt(Number(v))} />
            {data.map((d) => (
              <Cell key={d.stage} fill={STAGE_COLORS[d.stage] ?? DEFAULT_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
