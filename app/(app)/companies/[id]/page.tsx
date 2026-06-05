import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { sgd } from '@/lib/format/currency'
import { Badge } from '@/components/ui/badge'

export default async function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: company } = await supabase.from('companies').select('*').eq('id', id).single()
  if (!company) notFound()
  const { data: contacts } = await supabase.from('contacts').select('id,full_name,job_title').eq('company_id', id)
  const { data: deals } = await supabase.from('deals').select('id,name,stage,value_sgd').eq('company_id', id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">{company.name}</h1>
        <div className="mt-1 flex flex-wrap gap-2 text-sm text-white/60">
          {company.industry && <Badge variant="secondary">{company.industry}</Badge>}
          {company.size && <span>{company.size}</span>}
          {company.website && <a href={company.website} className="text-brand-primary hover:underline" target="_blank" rel="noreferrer">{company.website}</a>}
          {company.uen && <span>UEN {company.uen}</span>}
        </div>
        {company.notes && <p className="mt-2 max-w-2xl text-sm text-white/70">{company.notes}</p>}
      </div>

      <section>
        <h2 className="mb-2 font-display text-lg">Contacts</h2>
        {contacts?.length ? (
          <ul className="space-y-1 text-sm">
            {contacts.map((c) => (
              <li key={c.id}><Link href={`/contacts/${c.id}`} className="text-brand-primary hover:underline">{c.full_name}</Link>{c.job_title ? <span className="text-white/50"> · {c.job_title}</span> : null}</li>
            ))}
          </ul>
        ) : <p className="text-sm text-white/40">No contacts yet.</p>}
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg">Deals</h2>
        {deals?.length ? (
          <ul className="space-y-1 text-sm">
            {deals.map((d) => (
              <li key={d.id} className="flex items-center gap-2">
                <Link href={`/deals/${d.id}`} className="text-brand-primary hover:underline">{d.name}</Link>
                <Badge variant="secondary">{d.stage}</Badge>
                <span className="text-white/60">{sgd(d.value_sgd ?? 0)}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-white/40">No deals yet.</p>}
      </section>

      {/* TODO(Phase 8): replace with <ActivityTimeline /> for this company's deals' activities */}
      <section>
        <h2 className="mb-2 font-display text-lg">Activity</h2>
        <p className="text-sm text-white/40">Activity timeline coming in the Activities module.</p>
      </section>
    </div>
  )
}
