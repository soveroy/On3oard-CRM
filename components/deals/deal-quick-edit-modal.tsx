'use client'
import React, { useState, useTransition, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DEFAULT_STAGES } from '@/lib/domain/stages'
import { updateDeal } from '@/app/(app)/deals/actions'
import { toast } from 'sonner'

interface DealQuickEditModalProps {
  open: boolean
  dealId: string
  currentStage: string
  currentValue?: number | null
  currentNextStep?: string | null
  onClose: () => void
  onSave?: () => void
}

export function DealQuickEditModal({
  open,
  dealId,
  currentStage,
  currentValue,
  currentNextStep,
  onClose,
  onSave,
}: DealQuickEditModalProps) {
  const [pending, startTransition] = useTransition()
  const [stage, setStage] = useState(currentStage)
  const [value, setValue] = useState(currentValue?.toString() ?? '')
  const [nextStep, setNextStep] = useState(currentNextStep ?? '')

  // Reset form when deal changes
  useEffect(() => {
    setStage(currentStage)
    setValue(currentValue?.toString() ?? '')
    setNextStep(currentNextStep ?? '')
  }, [dealId, currentStage, currentValue, currentNextStep])

  function handleSave() {
    startTransition(async () => {
      const updates: Record<string, unknown> = {}

      if (stage !== currentStage) {
        updates.stage = stage
      }
      if (value && value !== currentValue?.toString()) {
        updates.value_sgd = Number(value)
      }
      if (nextStep !== currentNextStep) {
        updates.next_step = nextStep || null
      }

      // Only update if there are changes
      if (Object.keys(updates).length === 0) {
        onClose()
        return
      }

      const res = await updateDeal(dealId, updates)
      if (res.ok) {
        toast.success('Deal updated')
        onClose()
        onSave?.()
      } else {
        toast.error('Failed to update deal')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-h-[90vh] overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Update Deal</DialogTitle>
        </DialogHeader>

        <form className="space-y-4 py-4" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          {/* Stage */}
          <div className="space-y-1">
            <Label htmlFor="modal-stage">Stage</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger id="modal-stage">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_STAGES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value */}
          <div className="space-y-1">
            <Label htmlFor="modal-value">Value (SGD)</Label>
            <Input
              id="modal-value"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          {/* Next Step */}
          <div className="space-y-1">
            <Label htmlFor="modal-next-step">Next Step</Label>
            <textarea
              id="modal-next-step"
              className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="What's the next action?"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              rows={3}
            />
          </div>
        </form>

        <DialogFooter className="gap-2 md:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={pending}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="px-4 py-2 bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            {pending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
