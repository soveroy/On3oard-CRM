'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
export function PipelineBar({ data }: { data: { stage: string; count: number; value: number }[] }) {
  return (
    <div className="h-72 rounded-lg border border-surface-border bg-surface-raised/30 p-4">
      <h3 className="mb-2 text-sm font-medium text-white/70">Pipeline by stage</h3>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data} layout="vertical" margin={{ left: 28 }}>
          <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis type="category" dataKey="stage" width={92} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: '#11233a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
          <Bar dataKey="value" fill="#ff914d" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
