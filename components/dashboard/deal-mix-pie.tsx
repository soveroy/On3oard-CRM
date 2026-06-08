'use client'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const STAGE_COLORS: Record<string, string> = {
  'Lead':          '#6366f1',
  'Qualified':     '#3b82f6',
  'Discovery':     '#06b6d4',
  'Proposal Sent': '#ff914d',
  'Negotiation':   '#f59e0b',
  'Won':           '#22c55e',
  'Lost':          '#f93f58',
}
const DEFAULT_COLOR = '#94a3b8'

type Entry = { stage: string; count: number; value: number }

export function DealMixPie({ data }: { data: Entry[] }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 640)
  }, [])

  const chartHeight = isMobile ? 250 : 300
  const active = data.filter((d) => d.count > 0)

  if (!active.length) return (
    <div className="flex items-center justify-center rounded-lg border border-surface-border bg-surface-raised/30 p-4" style={{ height: chartHeight + 40 }}>
      <p className="text-sm text-white/40">No deals yet.</p>
    </div>
  )

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-4" style={{ height: chartHeight + 40 }}>
      <h3 className="mb-1 text-sm font-medium text-white/70">Deal mix by stage</h3>
      <ResponsiveContainer width="100%" height="92%">
        <PieChart>
          <Pie
            data={active} dataKey="count" nameKey="stage"
            cx="50%" cy="48%" outerRadius="72%" innerRadius="38%"
            paddingAngle={2} strokeWidth={0}
          >
            {active.map((d) => (
              <Cell key={d.stage} fill={STAGE_COLORS[d.stage] ?? DEFAULT_COLOR} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#11233a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 12 }}
            formatter={(v, _name, props) => {
              const n = Number(v)
              const total = active.reduce((s, d) => s + d.count, 0)
              const pct = total > 0 ? Math.round((n / total) * 100) : 0
              return [`${n} deals (${pct}%)`, (props as { payload?: { stage?: string } }).payload?.stage ?? '']
            }}
          />
          <Legend
            iconType="circle" iconSize={8}
            wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', paddingTop: 4 }}
            formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.65)' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
