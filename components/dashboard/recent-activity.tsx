import { fromNow } from '@/lib/format/date'
export type RecentItem = { id: string; type: string; subject: string | null; activity_date: string | null }
export function RecentActivity({ activities }: { activities: RecentItem[] }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-4">
      <h3 className="mb-3 text-sm font-medium text-white/70">Recent activity</h3>
      {activities.length ? (
        <ul className="space-y-2 text-sm">
          {activities.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate"><span className="text-white/40">{a.type}</span> · {a.subject || '—'}</span>
              <span className="shrink-0 text-xs text-white/40">{a.activity_date ? fromNow(a.activity_date) : ''}</span>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-white/40">No recent activity.</p>}
    </div>
  )
}
