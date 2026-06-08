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
import { INDUSTRIES, COMPANY_SIZES } from '@/lib/constants'
import { createCompany } from '@/app/(app)/companies/actions'
import { EnrichBox } from '@/components/ai/enrich-box'

export function CompanyForm({ openOnMount = false }: { openOnMount?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(openOnMount)
  const [pending, start] = useTransition()
  const [nameError, setNameError] = useState<string | null>(null)

  // Controlled state — these are filled by AI autofill AND read on submit
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [country, setCountry] = useState('Singapore')
  const [uen, setUen] = useState('')
  const [revenueRange, setRevenueRange] = useState('')
  const [notes, setNotes] = useState('')
  const [industry, setIndustry] = useState<string>('')
  const [size, setSize] = useState<string>('')

  useEffect(() => { if (openOnMount) setOpen(true) }, [openOnMount])

  function resetForm() {
    setNameError(null); setName(''); setWebsite(''); setCountry('Singapore')
    setUen(''); setRevenueRange(''); setNotes(''); setIndustry(''); setSize('')
  }

  function applyEnrichment(data: Record<string, unknown>) {
    if (typeof data.name === 'string' && data.name) setName(data.name)
    if (typeof data.website === 'string' && data.website) setWebsite(data.website)
    if (typeof data.country === 'string' && data.country) setCountry(data.country)
    if (typeof data.uen === 'string' && data.uen) setUen(data.uen)
    if (typeof data.revenue_range === 'string' && data.revenue_range) setRevenueRange(data.revenue_range)
    if (typeof data.notes === 'string' && data.notes) setNotes(data.notes)
    if (typeof data.industry === 'string' && data.industry) setIndustry(data.industry)
    if (typeof data.size === 'string' && data.size) setSize(data.size)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameError(null)
    const fd = new FormData(e.currentTarget)
    const tags = String(fd.get('tags') ?? '').split(',').map((t) => t.trim()).filter(Boolean)
    const payload = {
      name, website, industry: industry || undefined, size: size || undefined,
      country, uen, revenue_range: revenueRange, notes, tags,
    }
    start(async () => {
      const res = await createCompany(payload)
      if (res.ok) {
        toast.success('Company created')
        setOpen(false); resetForm(); router.refresh()
      } else if ('fieldErrors' in res && res.fieldErrors?.name) {
        setNameError(res.fieldErrors.name[0]!)
      } else {
        toast.error(('error' in res && res.error) || 'Could not create company')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-brand-primary text-white hover:bg-brand-primary/90">+ Add company</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Add company</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-2 pb-20 md:pb-0">
          <EnrichBox entity="company" onResult={applyEnrichment} />

          <div className="space-y-1">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" required />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} type="url" placeholder="https://example.com" />
          </div>

          <div className="space-y-1">
            <Label>Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>{INDUSTRIES.map((ind) => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>{COMPANY_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="uen">UEN</Label>
            <Input id="uen" value={uen} onChange={(e) => setUen(e.target.value)} placeholder="202312345A" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="revenue_range">Revenue range</Label>
            <Input id="revenue_range" value={revenueRange} onChange={(e) => setRevenueRange(e.target.value)} placeholder="e.g. $1M–$5M" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any additional context…" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" placeholder="e.g. vip, partner (comma-separated)" />
          </div>

          <DialogFooter className="fixed md:static bottom-0 left-0 right-0 md:flex gap-2 md:p-0 p-4 bg-surface-raised/95 md:bg-transparent border-t md:border-t-0 border-surface-border md:border-none">
            <Button type="button" variant="ghost" onClick={() => { setOpen(false); resetForm() }} className="w-full md:w-auto px-4 py-3">Cancel</Button>
            <Button type="submit" disabled={pending} className="w-full md:w-auto px-4 py-3 bg-brand-primary text-white hover:bg-brand-primary/90">
              {pending ? 'Creating…' : 'Create company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
