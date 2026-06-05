'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface FollowUpValue {
  nextAction: string
  nextActionDue: string
}

export function FollowUpPrompt({
  nextAction,
  nextActionDue,
  onChange,
}: {
  nextAction: string
  nextActionDue: string
  onChange: (next: FollowUpValue) => void
}) {
  return (
    <div className="space-y-3 rounded-md border border-surface-border bg-surface-raised/20 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-white/50">Set a follow-up?</p>
      <div className="space-y-1">
        <Label htmlFor="next_action">Follow-up action</Label>
        <Input
          id="next_action"
          value={nextAction}
          onChange={(e) => onChange({ nextAction: e.target.value, nextActionDue })}
          placeholder="e.g. Send proposal, follow up call…"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="next_action_due">Due date &amp; time</Label>
        <Input
          id="next_action_due"
          type="datetime-local"
          value={nextActionDue}
          onChange={(e) => onChange({ nextAction, nextActionDue: e.target.value })}
        />
      </div>
    </div>
  )
}
