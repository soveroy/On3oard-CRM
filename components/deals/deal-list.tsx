'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { sgd } from '@/lib/format/currency'
import { shortDate } from '@/lib/format/date'
import { HealthDot } from './health-dot'
import type { DealCardData } from './deal-card'

type SortKey = 'value_sgd' | 'close_date' | 'stage'
type SortDir = 'asc' | 'desc'

function cmp(a: DealCardData, b: DealCardData, key: SortKey, dir: SortDir): number {
  let result = 0
  if (key === 'value_sgd') {
    result = a.value_sgd - b.value_sgd
  } else if (key === 'close_date') {
    const da = a.close_date ?? ''
    const db = b.close_date ?? ''
    result = da < db ? -1 : da > db ? 1 : 0
  } else if (key === 'stage') {
    result = a.stage.localeCompare(b.stage)
  }
  return dir === 'asc' ? result : -result
}

export function DealList({ deals }: { deals: DealCardData[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('value_sgd')
  const [dir, setDir] = useState<SortDir>('desc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setDir('desc')
    }
  }

  const sorted = [...deals].sort((a, b) => cmp(a, b, sortKey, dir))
  const arrow = (key: SortKey) => sortKey === key ? (dir === 'asc' ? ' ↑' : ' ↓') : ''

  return (
    <div className="overflow-x-auto rounded-lg border border-surface-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-raised/40 text-left text-white/60">
          <tr>
            <th className="px-3 py-2 font-medium">Name</th>
            <th className="px-3 py-2 font-medium">Company</th>
            <th
              className="cursor-pointer select-none px-3 py-2 font-medium hover:text-white"
              onClick={() => toggleSort('stage')}
            >
              Stage{arrow('stage')}
            </th>
            <th
              className="cursor-pointer select-none px-3 py-2 font-medium hover:text-white"
              onClick={() => toggleSort('value_sgd')}
            >
              Value{arrow('value_sgd')}
            </th>
            <th
              className="cursor-pointer select-none px-3 py-2 font-medium hover:text-white"
              onClick={() => toggleSort('close_date')}
            >
              Close date{arrow('close_date')}
            </th>
            <th className="px-3 py-2 font-medium">Health</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d) => (
            <tr key={d.id} className="border-t border-surface-border hover:bg-white/5">
              <td className="px-3 py-2">
                <Link href={`/deals/${d.id}`} className="font-medium text-brand-primary hover:underline">
                  {d.name}
                </Link>
              </td>
              <td className="px-3 py-2 text-white/70">{d.company ?? <span className="text-white/30">—</span>}</td>
              <td className="px-3 py-2">
                <Badge variant="secondary">{d.stage}</Badge>
              </td>
              <td className="px-3 py-2 text-white/80">{sgd(d.value_sgd)}</td>
              <td className="px-3 py-2 text-white/70">{shortDate(d.close_date)}</td>
              <td className="px-3 py-2">
                <HealthDot score={d.health} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
