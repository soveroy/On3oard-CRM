import { createClient } from '@/lib/supabase/server'
import { bucketTasks } from '@/lib/domain/tasks'
import { shortDate, overdue } from '@/lib/format/date'
import { LogActivityForm } from '@/components/activities/log-activity-form'
import { ACTIVITY_TYPES } from '@/lib/constants'
import Link from 'next/link'

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const { new: isNew } = await searchParams
  const supabase = await createClient()
  const { data: pending } = await supabase.from('activities')
    .select('id,subject,next_action,next_action_due,deal_id,contact_id')
    .not('next_action_due', 'is', null)
    .order('next_action_due', { ascending: true })
  const since = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data: recent } = await supabase.from('activities').select('type,activity_date').gte('activity_date', since)
  const { data: deals } = await supabase.from('deals').select('id,name')
  const { data: contacts } = await supabase.from('contacts').select('id,full_name')

  const { overdue: od, today, upcoming } = bucketTasks(pending ?? [], new Date())
  const counts = ACTIVITY_TYPES.map((t) => ({ type: t, n: (recent ?? []).filter((r) => r.type === t).length })).filter((c) => c.n > 0)

  function Row({ a }: { a: { id: string; subject: string | null; next_action: string | null; next_action_due: string | null; deal_id: string | null; contact_id: string | null } }) {
    const href = a.deal_id ? `/deals/${a.deal_id}` : a.contact_id ? `/contacts/${a.contact_id}` : '#'
    return (
      <li className="flex items-center justify-between rounded-md border border-surface-border bg-surface-raised/30 px-3 py-2 text-sm">
        <Link href={href} className="text-brand-primary hover:underline">{a.next_action || a.subject || 'Follow-up'}</Link>
        <span className={overdue(a.next_action_due) ? 'text-[#f93f58]' : 'text-white/50'}>{shortDate(a.next_action_due)}</span>
      </li>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Activities</h1>
        <LogActivityForm deals={deals ?? []} contacts={contacts ?? []} openOnMount={isNew === '1'} />
      </div>

      <section>
        <h2 className="mb-2 font-display text-lg text-[#f93f58]">Overdue ({od.length})</h2>
        {od.length ? <ul className="space-y-2">{od.map((a) => <Row key={a.id} a={a} />)}</ul> : <p className="text-sm text-white/40">Nothing overdue. Nice.</p>}
      </section>
      <section>
        <h2 className="mb-2 font-display text-lg">Today ({today.length})</h2>
        {today.length ? <ul className="space-y-2">{today.map((a) => <Row key={a.id} a={a} />)}</ul> : <p className="text-sm text-white/40">No follow-ups due today.</p>}
      </section>
      <section>
        <h2 className="mb-2 font-display text-lg">Upcoming ({upcoming.length})</h2>
        {upcoming.length ? <ul className="space-y-2">{upcoming.map((a) => <Row key={a.id} a={a} />)}</ul> : <p className="text-sm text-white/40">No upcoming follow-ups.</p>}
      </section>
      <section>
        <h2 className="mb-2 font-display text-lg">This week</h2>
        {counts.length ? (
          <div className="flex flex-wrap gap-2 text-sm">
            {counts.map((c) => <span key={c.type} className="rounded-md border border-surface-border bg-surface-raised/30 px-3 py-1">{c.type}: {c.n}</span>)}
          </div>
        ) : <p className="text-sm text-white/40">No activity logged in the last 7 days.</p>}
      </section>
    </div>
  )
}
