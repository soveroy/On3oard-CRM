import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { sgd } from '@/lib/format/currency'
import { shortDate, fromNow } from '@/lib/format/date'
import { Badge } from '@/components/ui/badge'
import { MeetingPrepDrawer } from '@/components/deals/meeting-prep-drawer'
import { ActivityTimeline } from '@/components/activities/activity-timeline'
import { LogActivityForm } from '@/components/activities/log-activity-form'

type Embedded<T> = T | T[] | null
function one<T>(v: Embedded<T>): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v
}

export default async function DealDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: deal } = await supabase
    .from('deals')
    .select('*, companies(id,name), contacts(id,full_name,job_title)')
    .eq('id', id)
    .single()
  if (!deal) notFound()

  const company = one<{ id: string; name: string }>(deal.companies as never)
  const contact = one<{ id: string; full_name: string; job_title: string | null }>(deal.contacts as never)

  const { data: acts } = await supabase.from('activities').select('id,type,subject,activity_date,outcome,notes,next_action,next_action_due').eq('deal_id', id).order('activity_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">{deal.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/60">
            {company && (
              <Link href={`/companies/${company.id}`} className="text-brand-primary hover:underline">
                {company.name}
              </Link>
            )}
            {contact && (
              <>
                <span className="text-white/30">·</span>
                <Link href={`/contacts/${contact.id}`} className="text-brand-primary hover:underline">
                  {contact.full_name}
                </Link>
                {contact.job_title && <span className="text-white/40">({contact.job_title})</span>}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MeetingPrepDrawer dealId={deal.id} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Value">{sgd(deal.value_sgd ?? 0)}</Field>
        <Field label="Probability">{deal.probability ?? 0}%</Field>
        <Field label="Stage">
          <Badge variant="secondary">{deal.stage}</Badge>
          {deal.stage_changed_at && (
            <span className="ml-1 text-xs text-white/40">{fromNow(deal.stage_changed_at)}</span>
          )}
        </Field>
        <Field label="Priority">{deal.priority ?? 'Medium'}</Field>
        <Field label="Engagement">{deal.engagement_type ?? '—'}</Field>
        <Field label="Close date">{shortDate(deal.close_date)}</Field>
        <Field label="Source">{deal.source ?? '—'}</Field>
        {deal.stage === 'Lost' && <Field label="Lost reason">{deal.lost_reason ?? '—'}</Field>}
      </div>

      {deal.tags && deal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {deal.tags.map((t) => (
            <span key={t} className="rounded bg-white/5 px-2 py-0.5 text-xs text-white/60">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Activity */}
      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg">Activity</h2>
          <LogActivityForm dealId={deal.id} triggerLabel="+ Log activity" />
        </div>
        <ActivityTimeline activities={acts ?? []} />
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-3">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  )
}
