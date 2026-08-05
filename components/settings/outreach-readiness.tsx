'use client'

import { useState, useTransition } from 'react'
import { Ban, CheckCircle2, MailWarning, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Suppression = {
  id: string
  suppression_type: 'email' | 'domain'
  value: string
  reason: string
  source: string
  created_at: string
}

type DeliveryHealth = {
  delivered: number
  bounced: number
  complained: number
  failed: number
  tableReady: boolean
}

export function OutreachReadiness({
  initialSuppressions,
  deliveryHealth,
}: {
  initialSuppressions: Suppression[]
  deliveryHealth: DeliveryHealth
}) {
  const [suppressions, setSuppressions] = useState(initialSuppressions)
  const [type, setType] = useState<'email' | 'domain'>('email')
  const [value, setValue] = useState('')
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()

  function addSuppression() {
    startTransition(async () => {
      try {
        const response = await fetch('/api/suppressions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ suppression_type: type, value, reason }),
        })
        const body = await response.json()
        if (!response.ok) throw new Error(body.error ?? 'Failed to add suppression')
        setSuppressions((current) => [body.suppression, ...current.filter((item) => item.id !== body.suppression.id)])
        setValue('')
        setReason('')
        toast.success('Suppression added')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add suppression')
      }
    })
  }

  function deactivateSuppression(id: string) {
    startTransition(async () => {
      try {
        const response = await fetch('/api/suppressions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
        const body = await response.json()
        if (!response.ok) throw new Error(body.error ?? 'Failed to deactivate suppression')
        setSuppressions((current) => current.filter((item) => item.id !== id))
        toast.success('Suppression deactivated')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to deactivate suppression')
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <HealthMetric label="Delivered" value={deliveryHealth.delivered} icon={CheckCircle2} />
        <HealthMetric label="Bounced" value={deliveryHealth.bounced} icon={RotateCcw} />
        <HealthMetric label="Complaints" value={deliveryHealth.complained} icon={MailWarning} />
        <HealthMetric label="Failed" value={deliveryHealth.failed} icon={Ban} />
      </div>
      {!deliveryHealth.tableReady ? (
        <p className="rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200">
          Delivery tracking tables are unavailable. Apply Supabase migration 0008 before enabling webhook monitoring.
        </p>
      ) : null}

      <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-4">
        <div className="grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <Select value={type} onValueChange={(next: 'email' | 'domain') => setType(next)}>
            <SelectTrigger aria-label="Suppression type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="domain">Domain</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={type === 'email' ? 'person@company.com' : 'company.com'}
            aria-label="Suppression value"
          />
          <Input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason and source"
            aria-label="Suppression reason"
          />
          <Button
            type="button"
            onClick={addSuppression}
            disabled={isPending || !value.trim() || !reason.trim()}
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            <Ban className="h-4 w-4" />Suppress
          </Button>
        </div>

        <div className="mt-4 divide-y divide-surface-border border-t border-surface-border">
          {suppressions.map((item) => (
            <div key={item.id} className="grid gap-2 py-3 text-sm sm:grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
              <span className="w-fit rounded bg-white/5 px-2 py-1 text-xs uppercase text-white/50">{item.suppression_type}</span>
              <div className="min-w-0">
                <strong className="block truncate">{item.value}</strong>
                <span className="text-xs text-white/40">{item.source}</span>
              </div>
              <span className="text-xs text-white/50">{item.reason}</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => deactivateSuppression(item.id)}
                disabled={isPending}
              >
                Deactivate
              </Button>
            </div>
          ))}
          {!suppressions.length ? (
            <p className="py-5 text-sm text-white/40">No active suppressions.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function HealthMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: typeof CheckCircle2
}) {
  return (
    <div className="rounded-md border border-surface-border bg-surface-raised/30 p-3">
      <Icon className="h-4 w-4 text-white/40" />
      <strong className="mt-3 block font-display text-xl">{value}</strong>
      <span className="text-xs text-white/45">{label}</span>
    </div>
  )
}
