'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LOST_REASONS } from '@/lib/constants'

export function LostReasonDialog({ open, onCancel, onConfirm }: {
  open: boolean; onCancel: () => void; onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Mark deal as Lost</DialogTitle></DialogHeader>
        <p className="text-sm text-white/60">Select a reason so we can learn from it.</p>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger><SelectValue placeholder="Lost reason" /></SelectTrigger>
          <SelectContent>
            {LOST_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button disabled={!reason} onClick={() => onConfirm(reason)}>Confirm Lost</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
