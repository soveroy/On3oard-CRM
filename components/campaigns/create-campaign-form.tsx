'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AI_MODELS } from '@/lib/ai/models'
import { createCampaign } from '@/app/(app)/campaigns/actions'

export function CreateCampaignForm() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [audience, setAudience] = useState('all')
  const [model, setModel] = useState('claude-sonnet-4')

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await createCampaign({
        name: String(fd.get('name') ?? ''),
        brief: String(fd.get('brief') ?? ''),
        subject_line: String(fd.get('subject_line') ?? ''),
        audience: audience as 'prospects' | 'active' | 'past' | 'all',
        model,
      })
      if (res.ok) {
        toast.success('Campaign created. Next: Generate emails.')
        router.refresh()
        e.currentTarget.reset()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-surface-border bg-surface-raised/30 p-4 max-w-xl">
      <div className="space-y-1">
        <Label htmlFor="name">Campaign name</Label>
        <Input id="name" name="name" placeholder="Q2 Product Launch" required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="brief">Email brief (what to say)</Label>
        <Textarea id="brief" name="brief" rows={3} placeholder="e.g. Introduce our new AI audit product, highlight the time savings, include a 20% launch discount…" required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="subject_line">Subject line</Label>
        <Input id="subject_line" name="subject_line" placeholder="[Company name], here's your AI opportunity" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Send to</Label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prospects">Prospects only</SelectItem>
              <SelectItem value="active">Active clients only</SelectItem>
              <SelectItem value="past">Past clients only</SelectItem>
              <SelectItem value="all">Everyone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Model (writer)</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={pending} className="w-full bg-brand-primary text-white hover:bg-brand-primary/90">
        {pending ? 'Creating…' : 'Create campaign'}
      </Button>
    </form>
  )
}
