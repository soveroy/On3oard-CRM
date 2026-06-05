'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { sgd } from '@/lib/format/currency'
import { Badge } from '@/components/ui/badge'

export type CompanyRow = {
  id: string; name: string; industry: string | null; size: string | null
  contacts: { id: string }[]; deals: { value_sgd: number | null }[]
}

export function CompanyTable({ companies }: { companies: CompanyRow[] }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [q, setQ] = useState(sp.get('q') ?? '')
  return (
    <div className="space-y-3">
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') router.push('/companies' + (q.trim() ? '?q=' + encodeURIComponent(q.trim()) : '')) }}
        placeholder="Search companies…"
        className="w-full max-w-sm rounded-md bg-white/5 px-3 py-1.5 text-sm outline-none ring-1 ring-surface-border focus:ring-brand-primary/50"
      />
      <div className="overflow-x-auto rounded-lg border border-surface-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised/40 text-left text-white/60">
            <tr>
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 font-medium">Industry</th>
              <th className="px-3 py-2 font-medium">Size</th>
              <th className="px-3 py-2 font-medium">Contacts</th>
              <th className="px-3 py-2 font-medium">Deals</th>
              <th className="px-3 py-2 font-medium">Total value</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => {
              const total = c.deals.reduce((s, d) => s + (d.value_sgd ?? 0), 0)
              return (
                <tr key={c.id} className="border-t border-surface-border hover:bg-white/5">
                  <td className="px-3 py-2"><Link href={`/companies/${c.id}`} className="font-medium text-brand-primary hover:underline">{c.name}</Link></td>
                  <td className="px-3 py-2">{c.industry ? <Badge variant="secondary">{c.industry}</Badge> : <span className="text-white/40">—</span>}</td>
                  <td className="px-3 py-2 text-white/70">{c.size ?? '—'}</td>
                  <td className="px-3 py-2 text-white/70">{c.contacts.length}</td>
                  <td className="px-3 py-2 text-white/70">{c.deals.length}</td>
                  <td className="px-3 py-2">{sgd(total)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
