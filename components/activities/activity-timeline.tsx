import { fromNow, shortDate, overdue } from '@/lib/format/date'
import { Phone, Mail, Users, MessageCircle, Link2, FileText, FileSignature, StickyNote } from 'lucide-react'

export type ActivityTimelineItem = {
  id: string
  type: string
  subject: string | null
  activity_date: string | null
  outcome: string | null
  notes: string | null
  next_action: string | null
  next_action_due: string | null
}

const ICON: Record<string, typeof Phone> = {
  Call: Phone, Email: Mail, Meeting: Users, WhatsApp: MessageCircle,
  'LinkedIn Message': Link2, 'Proposal Sent': FileText, 'Contract Sent': FileSignature, Note: StickyNote,
}
const OUTCOME_COLOR: Record<string, string> = {
  Positive: 'text-[#22c55e]', Neutral: 'text-white/60', Negative: 'text-[#f93f58]', 'No Response': 'text-white/40',
}

export function ActivityTimeline({ activities }: { activities: ActivityTimelineItem[] }) {
  if (!activities.length) return <p className="text-sm text-white/40">No activity logged yet.</p>
  return (
    <ul className="space-y-3">
      {activities.map((a) => {
        const Icon = ICON[a.type] ?? StickyNote
        return (
          <li key={a.id} className="flex gap-3 rounded-md border border-surface-border bg-surface-raised/30 p-3">
            <Icon size={16} className="mt-0.5 shrink-0 text-brand-primary" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{a.subject || a.type}</span>
                <span className="shrink-0 text-xs text-white/40">{a.activity_date ? fromNow(a.activity_date) : ''}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs">
                <span className="text-white/40">{a.type}</span>
                {a.outcome && <span className={OUTCOME_COLOR[a.outcome] ?? 'text-white/60'}>{a.outcome}</span>}
              </div>
              {a.notes && <p className="mt-1 text-sm text-white/70">{a.notes}</p>}
              {a.next_action && (
                <div className={`mt-2 inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${overdue(a.next_action_due) ? 'bg-[#f93f58]/15 text-[#f93f58]' : 'bg-brand-primary/15 text-brand-primary'}`}>
                  Follow-up: {a.next_action}{a.next_action_due ? ` · ${shortDate(a.next_action_due)}` : ''}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
