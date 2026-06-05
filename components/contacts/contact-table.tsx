'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { fromNow } from '@/lib/format/date'

export type ContactRow = {
  id: string
  full_name: string
  job_title: string | null
  contact_type: string | null
  do_not_contact: boolean | null
  last_contacted_at: string | null
  companies: { name: string } | null
}

export function ContactTable({ contacts }: { contacts: ContactRow[] }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [q, setQ] = useState(sp.get('q') ?? '')
  return (
    <div className="space-y-3">
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') router.push('/contacts' + (q.trim() ? '?q=' + encodeURIComponent(q.trim()) : '')) }}
        placeholder="Search contacts…"
        className="w-full max-w-sm rounded-md bg-white/5 px-3 py-1.5 text-sm outline-none ring-1 ring-surface-border focus:ring-brand-primary/50"
      />
      <div className="overflow-x-auto rounded-lg border border-surface-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised/40 text-left text-white/60">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Job title</th>
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Last contacted</th>
              <th className="px-3 py-2 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-t border-surface-border hover:bg-white/5">
                <td className="px-3 py-2">
                  <Link href={`/contacts/${c.id}`} className="font-medium text-brand-primary hover:underline">
                    {c.full_name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-white/70">{c.job_title ?? '—'}</td>
                <td className="px-3 py-2 text-white/70">{c.companies?.name ?? '—'}</td>
                <td className="px-3 py-2">
                  {c.contact_type ? <Badge variant="secondary">{c.contact_type}</Badge> : <span className="text-white/40">—</span>}
                </td>
                <td className="px-3 py-2 text-white/70">
                  {c.last_contacted_at ? fromNow(c.last_contacted_at) : '—'}
                </td>
                <td className="px-3 py-2">
                  {c.do_not_contact && (
                    <span className="rounded bg-[#f93f58]/15 px-2 py-0.5 text-xs text-[#f93f58]">Do Not Contact</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
