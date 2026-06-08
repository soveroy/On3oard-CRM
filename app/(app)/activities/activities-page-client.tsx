'use client'
import { toast } from 'sonner'
import { ActivityListMobile } from '@/components/activities/activity-list-mobile'
import { LogActivityForm } from '@/components/activities/log-activity-form'
import { bucketTasks } from '@/lib/domain/tasks'
import { shortDate, overdue } from '@/lib/format/date'
import { ACTIVITY_TYPES } from '@/lib/constants'
import Link from 'next/link'

interface Activity {
  id: string
  type: string
  subject: string | null
  notes: string | null
  next_action_due: string | null
  deal_id: string | null
  contact_id: string | null
  deal?: { id: string; name: string } | null
  contact?: { id: string; full_name: string } | null
}

interface ActivitiesPageClientProps {
  pending: Activity[]
  completed: Activity[]
  deals: { id: string; name: string }[]
  contacts: { id: string; full_name: string }[]
  recent: { type: string }[]
}

function DesktopView({ pending, deals, contacts, recent }: {
  pending: Activity[]
  deals: { id: string; name: string }[]
  contacts: { id: string; full_name: string }[]
  recent: { type: string }[]
}) {
  const { overdue: od, today, upcoming } = bucketTasks(pending, new Date())
  const counts = ACTIVITY_TYPES.map((t) => ({ type: t, n: recent.filter((r) => r.type === t).length })).filter((c) => c.n > 0)

  function Row({ a }: { a: Activity }) {
    const href = a.deal_id ? `/deals/${a.deal_id}` : a.contact_id ? `/contacts/${a.contact_id}` : '#'
    return (
      <li className="flex items-center justify-between rounded-md border border-surface-border bg-surface-raised/30 px-3 py-2 text-sm">
        <Link href={href} className="text-brand-primary hover:underline">{a.next_action_due ? (a.subject || 'Follow-up') : 'Activity'}</Link>
        <span className={overdue(a.next_action_due) ? 'text-[#f93f58]' : 'text-white/50'}>{shortDate(a.next_action_due)}</span>
      </li>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Activities</h1>
        <LogActivityForm deals={deals} contacts={contacts} />
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

export function ActivitiesPageClient({
  pending,
  completed,
  deals,
  contacts,
  recent,
}: ActivitiesPageClientProps) {
  const handleMarkDone = async () => {
    // Note: This is a placeholder. In a full implementation, you'd have an updateActivity action
    // For now, just show a toast
    toast.info('Mark done functionality coming soon')
  }

  return (
    <>
      {/* Desktop view (md and up) */}
      <div className="hidden md:block">
        <DesktopView pending={pending} deals={deals} contacts={contacts} recent={recent} />
      </div>

      {/* Mobile view (below md) */}
      <div className="md:hidden">
        <ActivityListMobile
          upcomingActivities={pending}
          completedActivities={completed}
          onMarkDone={handleMarkDone}
        />
      </div>
    </>
  )
}
