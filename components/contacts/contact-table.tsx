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
  emails?: string[] | null
  phones?: string[] | null
  best_employee?: string | null
  best_score?: number | null
  companies: { name: string } | null
}

export function ContactTable({ contacts }: { contacts: ContactRow[] }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [q, setQ] = useState(sp.get('q') ?? '')
  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            router.push('/contacts' + (q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''))
          }
        }}
        placeholder="Search contacts..."
        className="w-full max-w-sm rounded-md bg-white/5 px-3 py-1.5 text-sm outline-none ring-1 ring-surface-border focus:ring-brand-primary/50"
      />
      <div className="overflow-x-auto rounded-lg border border-surface-border">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-surface-raised/40 text-left text-white/60">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Phone</th>
              <th className="px-3 py-2 font-medium">Employee fit</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Last contacted</th>
              <th className="px-3 py-2 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-t border-surface-border hover:bg-white/5">
                <td className="px-3 py-2">
                  <Link href={`/contacts/${contact.id}`} className="font-medium text-brand-primary hover:underline">
                    {contact.full_name}
                  </Link>
                  {contact.job_title && <span className="block text-xs text-white/45">{contact.job_title}</span>}
                </td>
                <td className="px-3 py-2 text-white/70">{contact.companies?.name ?? '-'}</td>
                <td className="px-3 py-2 text-white/70">
                  {contact.emails?.[0]
                    ? <a className="text-brand-primary hover:underline" href={`mailto:${contact.emails[0]}`}>{contact.emails[0]}</a>
                    : '-'}
                </td>
                <td className="px-3 py-2 text-white/70">
                  {contact.phones?.[0]
                    ? <a className="text-brand-primary hover:underline" href={`tel:${contact.phones[0]}`}>{contact.phones[0]}</a>
                    : '-'}
                </td>
                <td className="px-3 py-2">
                  {contact.best_employee
                    ? <span className="capitalize">{contact.best_employee} <strong className="ml-1 text-brand-primary">{contact.best_score ?? 0}</strong></span>
                    : <span className="text-white/40">-</span>}
                </td>
                <td className="px-3 py-2">
                  {contact.contact_type ? <Badge variant="secondary">{contact.contact_type}</Badge> : <span className="text-white/40">-</span>}
                </td>
                <td className="px-3 py-2 text-white/70">
                  {contact.last_contacted_at ? fromNow(contact.last_contacted_at) : '-'}
                </td>
                <td className="px-3 py-2">
                  {contact.do_not_contact && (
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
