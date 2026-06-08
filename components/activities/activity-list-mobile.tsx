'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ActivityMobileCard } from './activity-mobile-card'
import { QuickLogFAB } from './quick-log-fab'

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

interface ActivityListMobileProps {
  upcomingActivities: Activity[]
  completedActivities: Activity[]
  onMarkDone?: (activityId: string) => Promise<void>
}

export function ActivityListMobile({
  upcomingActivities,
  completedActivities,
  onMarkDone,
}: ActivityListMobileProps) {
  const [completedExpanded, setCompletedExpanded] = useState(false)

  const getActivityStatus = (activity: Activity): 'pending' | 'completed' | 'overdue' => {
    if (!activity.next_action_due) return 'pending'
    const dueDate = new Date(activity.next_action_due)
    const now = new Date()
    const dueDay = dueDate.toISOString().slice(0, 10)
    const nowDay = now.toISOString().slice(0, 10)
    return dueDay < nowDay ? 'overdue' : 'pending'
  }

  const getActivityHref = (activity: Activity): string => {
    if (activity.deal_id) return `/deals/${activity.deal_id}`
    if (activity.contact_id) return `/contacts/${activity.contact_id}`
    return '/activities'
  }

  const getLinkedRecord = (activity: Activity) => {
    if (activity.deal && activity.deal_id) {
      return { type: 'deal' as const, id: activity.deal_id, name: activity.deal.name }
    }
    if (activity.contact && activity.contact_id) {
      return { type: 'contact' as const, id: activity.contact_id, name: activity.contact.full_name }
    }
    return null
  }

  return (
    <div className="space-y-6 p-4 pb-24">
      {/* Upcoming Activities Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ChevronDown size={20} className="text-white/70" />
          <h2 className="font-display text-lg">Upcoming ({upcomingActivities.length})</h2>
        </div>
        {upcomingActivities.length === 0 ? (
          <p className="text-sm text-white/40">No upcoming activities. Great!</p>
        ) : (
          <div className="space-y-3">
            {upcomingActivities.map((activity) => (
              <ActivityMobileCard
                key={activity.id}
                id={activity.id}
                type={activity.type}
                description={activity.subject || activity.notes}
                dueDate={activity.next_action_due}
                linkedRecord={getLinkedRecord(activity)}
                status={getActivityStatus(activity)}
                href={getActivityHref(activity)}
                onMarkDone={
                  onMarkDone
                    ? () => onMarkDone(activity.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Completed Activities Section */}
      {completedActivities.length > 0 && (
        <section>
          <button
            onClick={() => setCompletedExpanded(!completedExpanded)}
            className="flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
          >
            {completedExpanded ? (
              <ChevronDown size={20} className="text-white/70" />
            ) : (
              <ChevronRight size={20} className="text-white/70" />
            )}
            <h2 className="font-display text-lg">Completed ({completedActivities.length})</h2>
          </button>
          {completedExpanded && (
            <div className="space-y-3">
              {completedActivities.map((activity) => (
                <ActivityMobileCard
                  key={activity.id}
                  id={activity.id}
                  type={activity.type}
                  description={activity.subject || activity.notes}
                  dueDate={activity.next_action_due}
                  linkedRecord={getLinkedRecord(activity)}
                  status="completed"
                  href={getActivityHref(activity)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Quick Log FAB */}
      <QuickLogFAB />
    </div>
  )
}
