'use client'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ENGAGEMENT_TYPES, LEAD_SOURCES, PRIORITIES } from '@/lib/constants'
import { DEFAULT_STAGES } from '@/lib/domain/stages'
import { createDeal } from '@/app/(app)/deals/actions'

export function DealForm({
  companies,
  contacts,
  openOnMount = false,
}: {
  companies: { id: string; name: string }[]
  contacts: { id: string; full_name: string }[]
  openOnMount?: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(openOnMount)
  const [pending, start] = useTransition()
  const [nameError, setNameError] = useState<string | null>(null)

  // Controlled state for selects
  const [companyId, setCompanyId] = useState<string>('')
  const [contactId, setContactId] = useState<string>('')
  const [engagementType, setEngagementType] = useState<string>('')
  const [stage, setStage] = useState<string>('Lead')
  const [source, setSource] = useState<string>('')
  const [priority, setPriority] = useState<string>('Medium')

  // Auto-suggest: name is "company — engagementType" when both chosen and name is empty
  const [name, setName] = useState<string>('')
  const [nameTouched, setNameTouched] = useState(false)

  useEffect(() => { if (openOnMount) setOpen(true) }, [openOnMount])

  // Auto-fill name if not yet touched
  useEffect(() => {
    if (!nameTouched && companyId && engagementType) {
      const co = companies.find((c) => c.id === companyId)
      if (co) {
        setName(`${co.name} — ${engagementType}`)
      }
    }
  }, [companyId, engagementType, nameTouched, companies])

  function resetForm() {
    setNameError(null)
    setCompanyId('')
    setContactId('')
    setEngagementType('')
    setStage('Lead')
    setSource('')
    setPriority('Medium')
    setName('')
    setNameTouched(false)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameError(null)
    const fd = new FormData(e.currentTarget)

    const splitTrim = (key: string) =>
      String(fd.get(key) ?? '').split(',').map((v) => v.trim()).filter(Boolean)

    const payload = {
      name,
      company_id: companyId || undefined,
      primary_contact_id: contactId || undefined,
      engagement_type: engagementType || undefined,
      value_sgd: Number(fd.get('value_sgd') ?? 0),
      close_date: String(fd.get('close_date') ?? '') || undefined,
      stage,
      source: source || undefined,
      priority,
      tags: splitTrim('tags'),
    }

    start(async () => {
      const res = await createDeal(payload)
      if (res.ok) {
        toast.success('Deal created')
        setOpen(false)
        resetForm()
        router.refresh()
      } else if ('fieldErrors' in res && res.fieldErrors?.name) {
        setNameError(res.fieldErrors.name[0]!)
      } else {
        toast.error(('error' in res && res.error) || 'Could not create deal')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-brand-primary text-white hover:bg-brand-primary/90">+ Add deal</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Add deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          {/* Company — choose first so auto-suggest works */}
          <div className="space-y-1">
            <Label>Company</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {companies.map((co) => (
                  <SelectItem key={co.id} value={co.id}>{co.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Engagement type */}
          <div className="space-y-1">
            <Label>Engagement type</Label>
            <Select value={engagementType} onValueChange={setEngagementType}>
              <SelectTrigger>
                <SelectValue placeholder="Select engagement type" />
              </SelectTrigger>
              <SelectContent>
                {ENGAGEMENT_TYPES.map((et) => (
                  <SelectItem key={et} value={et}>{et}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name — with auto-suggest */}
          <div className="space-y-1">
            <Label htmlFor="deal_name">Deal name <span className="text-destructive">*</span></Label>
            <Input
              id="deal_name"
              name="deal_name"
              placeholder="e.g. PNH Group — AI Strategy"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setNameTouched(true) }}
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          {/* Primary contact */}
          <div className="space-y-1">
            <Label>Primary contact</Label>
            <Select value={contactId} onValueChange={setContactId}>
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

          {/* Value */}
          <div className="space-y-1">
            <Label htmlFor="value_sgd">Value (SGD)</Label>
            <Input id="value_sgd" name="value_sgd" type="number" min={0} step="any" inputMode="decimal" placeholder="50000" defaultValue={0} />
          </div>

          {/* Close date */}
          <div className="space-y-1">
            <Label htmlFor="close_date">Close date</Label>
            <Input id="close_date" name="close_date" type="date" />
          </div>

          {/* Stage */}
          <div className="space-y-1">
            <Label>Stage</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_STAGES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lead source */}
          <div className="space-y-1">
            <Label>Lead source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((src) => (
                  <SelectItem key={src} value={src}>{src}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" placeholder="vip, high-value (comma-separated)" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => { setOpen(false); resetForm() }}>Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-brand-primary text-white hover:bg-brand-primary/90">
              {pending ? 'Creating…' : 'Create deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
