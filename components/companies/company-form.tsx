'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { EnrichBox } from '@/components/ai/enrich-box'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { INDUSTRIES, COMPANY_SIZES } from '@/lib/constants'
import { createCompany } from '@/app/(app)/companies/actions'

export function CompanyForm({ openOnMount = false }: { openOnMount?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(openOnMount)
  const [pending, start] = useTransition()
  const [nameError, setNameError] = useState<string | null>(null)
  // Controlled state for Select fields (shadcn Select does not emit native form fields)
  const [industry, setIndustry] = useState<string>('')
  const [size, setSize] = useState<string>('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { if (openOnMount) setOpen(true) }, [openOnMount])

  function setField(name: string, value: unknown) {
    if (typeof value !== 'string' || !value || !formRef.current) return
    const el = formRef.current.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null
    if (el) el.value = value
  }

  function applyEnrichment(data: Record<string, unknown>) {
    setField('name', data.name)
    setField('website', data.website)
    setField('country', data.country)
    setField('uen', data.uen)
    setField('revenue_range', data.revenue_range)
    setField('notes', data.notes)
    if (typeof data.industry === 'string') setIndustry(data.industry)
    if (typeof data.size === 'string') setSize(data.size)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameError(null)
    const fd = new FormData(e.currentTarget)
    const tags = String(fd.get('tags') ?? '').split(',').map((t) => t.trim()).filter(Boolean)
    const payload = {
      name: String(fd.get('name') ?? ''),
      website: String(fd.get('website') ?? ''),
      industry: industry || undefined,
      size: size || undefined,
      country: String(fd.get('country') ?? 'Singapore'),
      uen: String(fd.get('uen') ?? ''),
      revenue_range: String(fd.get('revenue_range') ?? ''),
      notes: String(fd.get('notes') ?? ''),
      tags,
    }
    start(async () => {
      const res = await createCompany(payload)
      if (res.ok) {
        toast.success('Company created')
        setOpen(false)
        setIndustry('')
        setSize('')
        router.refresh()
      } else if ('fieldErrors' in res && res.fieldErrors?.name) {
        setNameError(res.fieldErrors.name[0]!)
      } else {
        toast.error(('error' in res && res.error) || 'Could not create company')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-brand-primary text-white hover:bg-brand-primary/90">+ Add company</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Add company</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4 pt-2">
          <EnrichBox entity="company" onResult={applyEnrichment} />

          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input id="name" name="name" placeholder="Acme Corp" required />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          {/* Website */}
          <div className="space-y-1">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" placeholder="https://example.com" />
          </div>

          {/* Industry */}
          <div className="space-y-1">
            <Label>Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size */}
          <div className="space-y-1">
            <Label>Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-1">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" defaultValue="Singapore" />
          </div>

          {/* UEN */}
          <div className="space-y-1">
            <Label htmlFor="uen">UEN</Label>
            <Input id="uen" name="uen" placeholder="202312345A" />
          </div>

          {/* Revenue range */}
          <div className="space-y-1">
            <Label htmlFor="revenue_range">Revenue range</Label>
            <Input id="revenue_range" name="revenue_range" placeholder="e.g. $1M–$5M" />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="Any additional context…" />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" placeholder="e.g. vip, partner (comma-separated)" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-brand-primary text-white hover:bg-brand-primary/90">
              {pending ? 'Creating…' : 'Create company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
