'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ACTIVITY_TYPES } from '@/lib/constants'

interface ActivityQuickFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { type: string; description: string; dueDate: string | null }) => Promise<void>
  loading?: boolean
}

export function ActivityQuickForm({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: ActivityQuickFormProps) {
  const [type, setType] = useState('Call')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!description.trim()) {
      setError('Description is required')
      return
    }

    onSubmit({
      type,
      description: description.trim(),
      dueDate: dueDate || null,
    }).then(() => {
      setType('Call')
      setDescription('')
      setDueDate('')
      onOpenChange(false)
    }).catch((err) => {
      setError(err?.message || 'Failed to log activity')
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Quick log activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="space-y-1">
            <Label>Type <span className="text-destructive">*</span></Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              placeholder="What did you do or need to do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <Label htmlFor="due-date">Due date (optional)</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand-primary text-white hover:bg-brand-primary/90">
              {loading ? 'Logging…' : 'Log activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
