'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
export function RevenueTrend({ data }: { data: { month: string; value: number }[] }) {
  return (
    <div className="h-72 rounded-lg border border-surface-border bg-surface-raised/30 p-4">
      <h3 className="mb-2 text-sm font-medium text-white/70">Revenue — Won (last 6 months)</h3>
      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={data}>
          <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#11233a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
          <Line type="monotone" dataKey="value" stroke="#ff914d" strokeWidth={2} dot={{ fill: '#f93f58' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
