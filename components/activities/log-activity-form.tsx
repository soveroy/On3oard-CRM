'use client'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ACTIVITY_TYPES, OUTCOMES } from '@/lib/constants'
import { createActivity } from '@/app/(app)/activities/actions'
import { FollowUpPrompt } from './follow-up-prompt'

export function LogActivityForm({
  deals,
  contacts,
  dealId,
  contactId,
  openOnMount = false,
  triggerLabel,
}: {
  deals?: { id: string; name: string }[]
  contacts?: { id: string; full_name: string }[]
  dealId?: string
  contactId?: string
  openOnMount?: boolean
  triggerLabel?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(openOnMount)
  const [pending, start] = useTransition()

  // Controlled selects
  const [activityType, setActivityType] = useState<string>('Call')
  const [outcome, setOutcome] = useState<string>('')
  const [selectedDeal, setSelectedDeal] = useState<string>('')
  const [selectedContact, setSelectedContact] = useState<string>('')

  // Follow-up values
  const [nextAction, setNextAction] = useState('')
  const [nextActionDue, setNextActionDue] = useState('')

  // Field errors
  const [typeError, setTypeError] = useState<string | null>(null)

  // Default activity_date to now (datetime-local format)
  function nowLocal() {
    const d = new Date()
    // format as YYYY-MM-DDTHH:mm (datetime-local input value)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const [activityDate, setActivityDate] = useState(nowLocal)

  useEffect(() => { if (openOnMount) setOpen(true) }, [openOnMount])

  function resetForm() {
    setActivityType('Call')
    setOutcome('')
    setSelectedDeal('')
    setSelectedContact('')
    setNextAction('')
    setNextActionDue('')
    setTypeError(null)
    setActivityDate(nowLocal())
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTypeError(null)
    const fd = new FormData(e.currentTarget)

    const raw = {
      type: activityType || undefined,
      subject: String(fd.get('subject') ?? '') || undefined,
      activity_date: activityDate ? new Date(activityDate).toISOString() : undefined,
      duration_mins: String(fd.get('duration_mins') ?? '') || undefined,
      outcome: outcome || undefined,
      deal_id: dealId ?? (selectedDeal || null),
      contact_id: contactId ?? (selectedContact || null),
      notes: String(fd.get('notes') ?? '') || undefined,
      next_action: nextAction || undefined,
      next_action_due: nextActionDue ? new Date(nextActionDue).toISOString() : null,
    }

    start(async () => {
      const res = await createActivity(raw)
      if (res.ok) {
        toast.success('Activity logged')
        setOpen(false)
        resetForm()
        router.refresh()
      } else if ('fieldErrors' in res && res.fieldErrors?.type) {
        setTypeError(res.fieldErrors.type[0] ?? null)
      } else {
        toast.error(('error' in res && res.error) || 'Could not log activity')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-brand-primary text-white hover:bg-brand-primary/90">
          {triggerLabel ?? '+ Log activity'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Log activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          {/* Type */}
          <div className="space-y-1">
            <Label>Type <span className="text-destructive">*</span></Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {typeError && <p className="text-xs text-destructive">{typeError}</p>}
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" placeholder="e.g. Intro call with Joseph" />
          </div>

          {/* Activity date */}
          <div className="space-y-1">
            <Label htmlFor="activity_date">Date &amp; time</Label>
            <Input
              id="activity_date"
              type="datetime-local"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <Label htmlFor="duration_mins">Duration (minutes)</Label>
            <Input id="duration_mins" name="duration_mins" type="number" min={1} placeholder="30" />
          </div>

          {/* Outcome */}
          <div className="space-y-1">
            <Label>Outcome</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                {OUTCOMES.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Linked deal */}
          {dealId ? (
            <input type="hidden" name="deal_id" value={dealId} />
          ) : deals && deals.length > 0 ? (
            <div className="space-y-1">
              <Label>Linked deal</Label>
              <Select value={selectedDeal} onValueChange={setSelectedDeal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select deal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {deals.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {/* Linked contact */}
          {contactId ? (
            <input type="hidden" name="contact_id" value={contactId} />
          ) : contacts && contacts.length > 0 ? (
            <div className="space-y-1">
              <Label>Linked contact</Label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="Any context or key points…" />
          </div>

          {/* Follow-up — always visible */}
          <FollowUpPrompt
            nextAction={nextAction}
            nextActionDue={nextActionDue}
            onChange={({ nextAction: na, nextActionDue: nad }) => {
              setNextAction(na)
              setNextActionDue(nad)
            }}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => { setOpen(false); resetForm() }}>Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-brand-primary text-white hover:bg-brand-primary/90">
              {pending ? 'Saving…' : 'Log activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
