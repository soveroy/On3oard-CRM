'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { EnrichBox } from '@/components/ai/enrich-box'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { LEAD_SOURCES, CONTACT_TYPES } from '@/lib/constants'
import { createContact } from '@/app/(app)/contacts/actions'

export function ContactForm({
  companies,
  openOnMount = false,
}: {
  companies: { id: string; name: string }[]
  openOnMount?: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(openOnMount)
  const [pending, start] = useTransition()
  const [nameError, setNameError] = useState<string | null>(null)
  const [duplicateId, setDuplicateId] = useState<string | null>(null)

  // Controlled Select state (shadcn Select does not emit native form fields)
  const [companyId, setCompanyId] = useState<string>('')
  const [leadSource, setLeadSource] = useState<string>('')
  const [contactType, setContactType] = useState<string>('')
  // Controlled Switch state
  const [doNotContact, setDoNotContact] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { if (openOnMount) setOpen(true) }, [openOnMount])

  function setField(name: string, value: unknown) {
    if (typeof value !== 'string' || !value || !formRef.current) return
    const el = formRef.current.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null
    if (el) el.value = value
  }

  function applyEnrichment(data: Record<string, unknown>) {
    setField('full_name', data.full_name)
    setField('job_title', data.job_title)
    setField('linkedin_url', data.linkedin_url)
    setField('notes', data.notes)
    if (typeof data.lead_source === 'string') setLeadSource(data.lead_source)
    // Match the researched company name to an existing company in the list.
    if (typeof data.company === 'string' && data.company) {
      const needle = data.company.toLowerCase()
      const match = companies.find((c) => c.name.toLowerCase().includes(needle) || needle.includes(c.name.toLowerCase()))
      if (match) setCompanyId(match.id)
      else toast.message(`No matching company for “${data.company}” — add it first to link, or set it manually.`)
    }
  }

  function resetForm() {
    setNameError(null)
    setDuplicateId(null)
    setCompanyId('')
    setLeadSource('')
    setContactType('')
    setDoNotContact(false)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameError(null)
    setDuplicateId(null)
    const fd = new FormData(e.currentTarget)

    const splitTrim = (key: string) =>
      String(fd.get(key) ?? '').split(',').map((v) => v.trim()).filter(Boolean)

    const payload = {
      full_name: String(fd.get('full_name') ?? ''),
      job_title: String(fd.get('job_title') ?? '') || undefined,
      company_id: companyId || undefined,
      emails: splitTrim('emails'),
      phones: splitTrim('phones'),
      linkedin_url: String(fd.get('linkedin_url') ?? '') || undefined,
      whatsapp: String(fd.get('whatsapp') ?? '') || undefined,
      lead_source: leadSource || undefined,
      contact_type: contactType || undefined,
      do_not_contact: doNotContact,
      tags: splitTrim('tags'),
      notes: String(fd.get('notes') ?? '') || undefined,
    }

    start(async () => {
      const res = await createContact(payload)
      if (res.ok) {
        toast.success('Contact created')
        setOpen(false)
        resetForm()
        router.refresh()
      } else if ('duplicateId' in res && res.duplicateId) {
        setDuplicateId(res.duplicateId)
        toast.error('A contact with this email already exists')
      } else if ('fieldErrors' in res && res.fieldErrors?.full_name) {
        setNameError(res.fieldErrors.full_name[0]!)
      } else {
        toast.error(('error' in res && res.error) || 'Could not create contact')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-brand-primary text-white hover:bg-brand-primary/90">+ Add contact</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Add contact</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4 pt-2">
          <EnrichBox entity="contact" onResult={applyEnrichment} />

          {/* Full name */}
          <div className="space-y-1">
            <Label htmlFor="full_name">Name <span className="text-destructive">*</span></Label>
            <Input id="full_name" name="full_name" placeholder="Joseph Lim" required />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          {/* Job title */}
          <div className="space-y-1">
            <Label htmlFor="job_title">Job title</Label>
            <Input id="job_title" name="job_title" placeholder="CEO" />
          </div>

          {/* Company */}
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

          {/* Emails */}
          <div className="space-y-1">
            <Label htmlFor="emails">Emails</Label>
            <Input id="emails" name="emails" placeholder="joseph@pnh.com.sg, joseph@gmail.com (comma-separated)" />
            {duplicateId && (
              <p className="text-xs text-[#f93f58]">
                Duplicate email.{' '}
                <Link href={`/contacts/${duplicateId}`} className="underline hover:text-[#f93f58]/80">
                  View existing contact
                </Link>
              </p>
            )}
          </div>

          {/* Phones */}
          <div className="space-y-1">
            <Label htmlFor="phones">Phones</Label>
            <Input id="phones" name="phones" placeholder="+65 9123 4567 (comma-separated)" />
          </div>

          {/* LinkedIn */}
          <div className="space-y-1">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/…" />
          </div>

          {/* WhatsApp */}
          <div className="space-y-1">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" placeholder="+65 9123 4567" />
          </div>

          {/* Lead source */}
          <div className="space-y-1">
            <Label>Lead source</Label>
            <Select value={leadSource} onValueChange={setLeadSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select lead source" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((src) => (
                  <SelectItem key={src} value={src}>{src}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact type */}
          <div className="space-y-1">
            <Label>Contact type</Label>
            <Select value={contactType} onValueChange={setContactType}>
              <SelectTrigger>
                <SelectValue placeholder="Select contact type" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TYPES.map((ct) => (
                  <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Do Not Contact */}
          <div className="flex items-center gap-3">
            <Switch
              id="do_not_contact"
              checked={doNotContact}
              onCheckedChange={setDoNotContact}
            />
            <Label htmlFor="do_not_contact" className="cursor-pointer">
              Do Not Contact <span className="text-white/50">(PDPA flag)</span>
            </Label>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" placeholder="vip, decision-maker (comma-separated)" />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="Any additional context…" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => { setOpen(false); resetForm() }}>Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-brand-primary text-white hover:bg-brand-primary/90">
              {pending ? 'Creating…' : 'Create contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
