import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { sgd } from '@/lib/format/currency'
import { ActivityTimeline } from '@/components/activities/activity-timeline'
import { LogActivityForm } from '@/components/activities/log-activity-form'

export default async function ContactDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: contact } = await supabase
    .from('contacts')
    .select('*, companies(name)')
    .eq('id', id)
    .single()
  if (!contact) notFound()

  const { data: deals } = await supabase
    .from('deals')
    .select('id,name,stage,value_sgd')
    .eq('primary_contact_id', id)

  const { data: acts } = await supabase.from('activities').select('id,type,subject,activity_date,outcome,notes,next_action,next_action_due').eq('contact_id', id).order('activity_date', { ascending: false })

  const companiesEmbed = contact.companies as { name: string } | null
  const scoreRows = [
    ['Hana', contact.hana_score],
    ['Felix', contact.felix_score],
    ['Aria', contact.aria_score],
  ] as const

  return (
    <div className="space-y-6">
      {/* PDPA Do Not Contact banner */}
      {contact.do_not_contact && (
        <div className="rounded-md border border-[#f93f58]/40 bg-[#f93f58]/10 px-4 py-2 text-sm text-[#f93f58]">
          ⚠ Do Not Contact — PDPA flag set. Do not send outreach to this contact.
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl">{contact.full_name}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/60">
          {contact.job_title && <span>{contact.job_title}</span>}
          {contact.job_title && companiesEmbed && <span className="text-white/30">·</span>}
          {companiesEmbed && contact.company_id && (
            <Link href={`/companies/${contact.company_id}`} className="text-brand-primary hover:underline">
              {companiesEmbed.name}
            </Link>
          )}
        </div>
      </div>

      {/* Contact methods */}
      <section>
        <h2 className="mb-2 font-display text-lg">Contact methods</h2>
        <dl className="space-y-1 text-sm">
          {contact.emails?.length ? (
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-white/50">Email</dt>
              <dd className="text-white/80">{contact.emails.join(', ')}</dd>
            </div>
          ) : null}
          {contact.phones?.length ? (
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-white/50">Phone</dt>
              <dd className="text-white/80">{contact.phones.join(', ')}</dd>
            </div>
          ) : null}
          {contact.linkedin_url ? (
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-white/50">LinkedIn</dt>
              <dd>
                <a href={contact.linkedin_url} target="_blank" rel="noreferrer" className="text-brand-primary hover:underline">
                  {contact.linkedin_url}
                </a>
              </dd>
            </div>
          ) : null}
          {contact.whatsapp ? (
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-white/50">WhatsApp</dt>
              <dd className="text-white/80">{contact.whatsapp}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {contact.prospect_lead_id && (
        <section className="space-y-3">
          <div>
            <h2 className="font-display text-lg">Prospect intelligence</h2>
            <p className="text-xs text-white/45">Structured data synchronized from On3oard Prospect Platform.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg border border-surface-border bg-surface-border md:grid-cols-4">
            <div className="bg-[#0D1B2A] p-3">
              <span className="block text-xs text-white/45">Best employee</span>
              <strong className="mt-1 block capitalize text-brand-primary">{contact.best_employee ?? '-'}</strong>
            </div>
            <div className="bg-[#0D1B2A] p-3">
              <span className="block text-xs text-white/45">Best score</span>
              <strong className="mt-1 block">{contact.best_score ?? '-'}</strong>
            </div>
            <div className="bg-[#0D1B2A] p-3">
              <span className="block text-xs text-white/45">Prospect lead ID</span>
              <strong className="mt-1 block font-mono text-xs">{contact.prospect_lead_id}</strong>
            </div>
            <div className="bg-[#0D1B2A] p-3">
              <span className="block text-xs text-white/45">Last synchronized</span>
              <strong className="mt-1 block text-sm">
                {contact.prospect_synced_at ? new Date(contact.prospect_synced_at).toLocaleString('en-SG') : '-'}
              </strong>
            </div>
          </div>
          <div className="grid max-w-2xl gap-3">
            {scoreRows.map(([employee, score]) => (
              <div key={employee} className="grid grid-cols-[52px_1fr_32px] items-center gap-3 text-sm">
                <span>{employee}</span>
                <div className="h-2 overflow-hidden bg-white/10">
                  <div className="h-full bg-brand-primary" style={{ width: `${score ?? 0}%` }} />
                </div>
                <strong className="text-right">{score ?? 0}</strong>
              </div>
            ))}
          </div>
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 text-white/50">Decision role</dt>
              <dd className="text-white/80">{contact.job_title ?? '-'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 text-white/50">Contact readiness</dt>
              <dd className="text-white/80">
                {contact.decision_status
                  ? `${contact.decision_status.replace('_', ' ')} (${contact.decision_confidence ?? 0}% confidence)`
                  : '-'}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 text-white/50">Employee fit</dt>
              <dd className="capitalize text-white/80">{contact.decision_employee ?? contact.best_employee ?? '-'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 text-white/50">Evidence</dt>
              <dd className="min-w-0 text-white/80">
                {contact.decision_evidence_url
                  ? <a className="break-all text-brand-primary hover:underline" href={contact.decision_evidence_url} target="_blank" rel="noreferrer">{contact.decision_evidence_url}</a>
                  : '-'}
                {contact.decision_evidence_text && <p className="mt-1 text-xs text-white/55">{contact.decision_evidence_text}</p>}
              </dd>
            </div>
            {contact.decision_review_reason && (
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-white/50">Review reason</dt>
                <dd className="text-white/80">{contact.decision_review_reason}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 text-white/50">Approved</dt>
              <dd className="text-white/80">
                {contact.prospect_approved_at ? new Date(contact.prospect_approved_at).toLocaleString('en-SG') : '-'}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 text-white/50">Approval hash</dt>
              <dd className="break-all font-mono text-xs text-white/60">{contact.prospect_approval_hash ?? '-'}</dd>
            </div>
          </dl>
        </section>
      )}

      {/* Classification */}
      <section>
        <h2 className="mb-2 font-display text-lg">Classification</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {contact.contact_type && <Badge variant="secondary">{contact.contact_type}</Badge>}
          {contact.lead_source && <Badge variant="outline">{contact.lead_source}</Badge>}
          {contact.tags?.map((tag) => (
            <span key={tag} className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70">{tag}</span>
          ))}
          {!contact.contact_type && !contact.lead_source && !contact.tags?.length && (
            <span className="text-white/40">No classification set.</span>
          )}
        </div>
      </section>

      {/* Notes */}
      {contact.notes && (
        <section>
          <h2 className="mb-2 font-display text-lg">Notes</h2>
          <p className="max-w-2xl text-sm text-white/70">{contact.notes}</p>
        </section>
      )}

      {/* Deals */}
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
        ) : <p className="text-sm text-white/40">No deals linked yet.</p>}
      </section>

      {/* Activity */}
      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg">Activity</h2>
          {contact.do_not_contact
            ? <span className="text-xs text-white/40">Outreach disabled (Do Not Contact)</span>
            : <LogActivityForm contactId={id} triggerLabel="+ Log activity" />}
        </div>
        <ActivityTimeline activities={acts ?? []} allowEmailDraft={!contact.do_not_contact} />
      </section>
    </div>
  )
}
