import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/brand/empty-state'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const term = (q ?? '').trim()
  if (!term) return <EmptyState title="Search" hint="Type a name in the top bar to search contacts, companies, and deals." />

  const supabase = await createClient()
  const [contacts, companies, deals] = await Promise.all([
    supabase.from('contacts').select('id,full_name,job_title').ilike('full_name', `%${term}%`).limit(10),
    supabase.from('companies').select('id,name,industry').ilike('name', `%${term}%`).limit(10),
    supabase.from('deals').select('id,name,stage').ilike('name', `%${term}%`).limit(10),
  ])
  const total = (contacts.data?.length ?? 0) + (companies.data?.length ?? 0) + (deals.data?.length ?? 0)

  if (!total) return <EmptyState title={`No results for "${term}"`} hint="Try a different name." />

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl">Results for &ldquo;{term}&rdquo;</h1>

      <Group title="Contacts">
        {contacts.data?.map((c) => (
          <Link key={c.id} href={`/contacts/${c.id}`} className="block rounded-md border border-surface-border bg-surface-raised/30 px-3 py-2 text-sm hover:bg-white/5">
            <span className="text-brand-primary">{c.full_name}</span>{c.job_title ? <span className="text-white/40"> · {c.job_title}</span> : null}
          </Link>
        ))}
      </Group>

      <Group title="Companies">
        {companies.data?.map((c) => (
          <Link key={c.id} href={`/companies/${c.id}`} className="block rounded-md border border-surface-border bg-surface-raised/30 px-3 py-2 text-sm hover:bg-white/5">
            <span className="text-brand-primary">{c.name}</span>{c.industry ? <span className="text-white/40"> · {c.industry}</span> : null}
          </Link>
        ))}
      </Group>

      <Group title="Deals">
        {deals.data?.map((d) => (
          <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center justify-between rounded-md border border-surface-border bg-surface-raised/30 px-3 py-2 text-sm hover:bg-white/5">
            <span className="text-brand-primary">{d.name}</span><Badge variant="secondary">{d.stage}</Badge>
          </Link>
        ))}
      </Group>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children
  const empty = Array.isArray(items) ? items.length === 0 : !items
  if (empty) return null
  return (
    <section>
      <h2 className="mb-2 text-xs uppercase tracking-wide text-white/40">{title}</h2>
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}
