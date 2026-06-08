import Link from 'next/link'
import { sgd } from '@/lib/format/currency'
import { shortDate } from '@/lib/format/date'

export type TopDeal = {
  id: string; name: string; company: string | null
  value_sgd: number; close_date: string | null; stage: string
}

// Distinctive colour per stage, matching the pipeline-bar palette
const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  'Lead':          { bg: 'bg-indigo-500/20',  text: 'text-indigo-300' },
  'Qualified':     { bg: 'bg-blue-500/20',    text: 'text-blue-300' },
  'Discovery':     { bg: 'bg-cyan-500/20',    text: 'text-cyan-300' },
  'Proposal Sent': { bg: 'bg-orange-500/20',  text: 'text-orange-300' },
  'Negotiation':   { bg: 'bg-amber-500/20',   text: 'text-amber-300' },
  'Won':           { bg: 'bg-green-500/20',   text: 'text-green-300' },
  'Lost':          { bg: 'bg-rose-500/20',    text: 'text-rose-300' },
}
const DEFAULT_STAGE = { bg: 'bg-white/10', text: 'text-white/60' }

// Rank bar: fills proportionally to value vs the top deal
function RankBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="mt-1 h-1 w-full rounded-full bg-white/5">
      <div className="h-1 rounded-full bg-brand-primary/60" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function TopDeals({ deals }: { deals: TopDeal[] }) {
  const max = deals[0]?.value_sgd ?? 0
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-4">
      <h3 className="mb-3 text-sm font-medium text-white/70">Top 5 open deals</h3>
      {deals.length ? (
        <>
          {/* Desktop: List view with rank bar */}
          <ul className="hidden space-y-3 md:block">
            {deals.map((d, i) => {
              const sc = STAGE_COLORS[d.stage] ?? DEFAULT_STAGE
              return (
                <li key={d.id}>
                  <div className="flex items-start justify-between gap-2 text-sm">
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-white/40">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <Link href={`/deals/${d.id}`} className="font-medium text-white hover:text-brand-primary">
                          {d.name}
                        </Link>
                        {d.company && <p className="truncate text-xs text-white/40">{d.company}</p>}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="font-medium text-brand-primary">{sgd(d.value_sgd)}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.text}`}>{d.stage}</span>
                        <span className="text-xs text-white/30">{shortDate(d.close_date)}</span>
                      </div>
                    </div>
                  </div>
                  <RankBar value={d.value_sgd} max={max} />
                </li>
              )
            })}
          </ul>

          {/* Mobile: Card list */}
          <div className="space-y-2 md:hidden">
            {deals.map((d) => {
              const sc = STAGE_COLORS[d.stage] ?? DEFAULT_STAGE
              return (
                <Link
                  key={d.id}
                  href={`/deals/${d.id}`}
                  className="block rounded-lg border border-surface-border bg-surface-raised/30 p-3 hover:bg-surface-raised/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-white truncate">{d.name}</h4>
                      {d.company && <p className="text-xs text-white/60 truncate mt-0.5">{d.company}</p>}
                    </div>
                    <span className="font-bold text-brand-primary whitespace-nowrap ml-2">{sgd(d.value_sgd)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.text}`}>{d.stage}</span>
                    <span className="text-xs text-white/30">{shortDate(d.close_date)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      ) : <p className="text-sm text-white/40">No open deals.</p>}
    </div>
  )
}
