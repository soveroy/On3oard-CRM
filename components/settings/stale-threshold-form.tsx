'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStaleThreshold } from '@/app/(app)/settings/actions'

interface StaleThresholdFormProps {
  initial: number
}

export function StaleThresholdForm({ initial }: StaleThresholdFormProps) {
  const [days, setDays] = useState(String(initial))
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await updateStaleThreshold(days)
      if (result.ok) {
        toast.success('Stale threshold updated')
      } else {
        toast.error(result.error ?? 'Failed to update')
      }
    })
  }

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-4 space-y-3">
      <div className="flex items-end gap-3">
        <div className="space-y-1.5 flex-1 max-w-xs">
          <Label htmlFor="stale-days">Days without activity</Label>
          <Input
            id="stale-days"
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white"
        >
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
      <p className="text-xs text-white/40">Deals with no activity for this many days will be flagged stale on the pipeline board.</p>
    </div>
  )
}
