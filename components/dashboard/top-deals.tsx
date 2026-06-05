import Link from 'next/link'
import { sgd } from '@/lib/format/currency'
import { shortDate } from '@/lib/format/date'
import { Badge } from '@/components/ui/badge'
export type TopDeal = { id: string; name: string; company: string | null; value_sgd: number; close_date: string | null; stage: string }
export function TopDeals({ deals }: { deals: TopDeal[] }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-4">
      <h3 className="mb-3 text-sm font-medium text-white/70">Top 5 open deals</h3>
      {deals.length ? (
        <ul className="space-y-2">
          {deals.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <Link href={`/deals/${d.id}`} className="font-medium text-brand-primary hover:underline">{d.name}</Link>
                {d.company && <span className="ml-1 text-white/40">· {d.company}</span>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary">{d.stage}</Badge>
                <span>{sgd(d.value_sgd)}</span>
                <span className="text-white/40">{shortDate(d.close_date)}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-white/40">No open deals.</p>}
    </div>
  )
}
