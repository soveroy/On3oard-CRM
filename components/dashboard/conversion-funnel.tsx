'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

// Gradient from bright (many leads) to deep green (won), visually funnelling down
const FUNNEL_COLORS = ['#6366f1','#3b82f6','#06b6d4','#ff914d','#f59e0b','#22c55e']

export function ConversionFunnel({ data }: { data: { stage: string; count: number }[] }) {
  return (
    <div className="h-80 rounded-lg border border-surface-border bg-surface-raised/30 p-4">
      <h3 className="mb-3 text-sm font-medium text-white/70">Conversion funnel</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 36 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category" dataKey="stage" width={96}
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
            tickLine={false} axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{ background: '#11233a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 12 }}
            formatter={(v) => [Number(v), 'Deals']}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
            <LabelList dataKey="count" position="right" style={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            {data.map((d, i) => (
              <Cell key={d.stage} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]!} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
