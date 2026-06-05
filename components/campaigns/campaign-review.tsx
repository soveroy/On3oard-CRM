'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Sparkles, Send, Check, X } from 'lucide-react'
import { updateCampaignEmailStatus } from '@/app/(app)/campaigns/actions'

type Campaign = { id: string; name: string; brief: string; audience: string }
type Email = { id: string; campaign_id: string; to_name: string; to_email: string; subject: string; body: string; status: string }

export function CampaignReview({ campaign, emails }: { campaign: Campaign; emails: Email[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [generating, setGenerating] = useState(false)
  const [previewing, setPreviewing] = useState<string | null>(null)

  const pending_emails = emails.filter((e) => e.status === 'pending')
  const approved_emails = emails.filter((e) => e.status === 'approved')

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id }),
      })
      const data = (await res.json()) as { generated?: number; error?: string }
      if (!res.ok) { toast.error(data.error ?? 'Failed to generate'); return }
      toast.success(`Generated ${data.generated ?? 0} emails`)
      router.refresh()
    } finally {
      setGenerating(false)
    }
  }

  async function handleApprove(emailId: string) {
    start(async () => {
      const res = await updateCampaignEmailStatus(emailId, 'approved')
      if (res.ok) {
        toast.success('Email approved')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  async function handleReject(emailId: string) {
    start(async () => {
      const res = await updateCampaignEmailStatus(emailId, 'rejected')
      if (res.ok) {
        toast.success('Email rejected')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  async function handleSendAll() {
    if (!approved_emails.length) { toast.error('No approved emails'); return }
    if (!confirm(`Send ${approved_emails.length} approved emails?`)) return

    start(async () => {
      try {
        const res = await fetch('/api/campaigns/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignEmailIds: approved_emails.map((e) => e.id) }),
        })
        const data = (await res.json()) as { sent?: number; failed?: number; error?: string }
        if (!res.ok) { toast.error(data.error ?? 'Send failed'); return }
        toast.success(`Sent ${data.sent ?? 0} emails${data.failed ? `, ${data.failed} failed` : ''}`)
        router.refresh()
      } catch {
        toast.error('Send error')
      }
    })
  }

  return (
    <div className="space-y-4 rounded-lg border border-surface-border bg-surface-raised/30 p-4">
      {/* Campaign header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-white">{campaign.name}</h3>
          <p className="mt-1 text-xs text-white/60">{campaign.brief}</p>
        </div>
        {!emails.length ? (
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            className="gap-1 bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            <Sparkles size={14} /> {generating ? 'Generating…' : 'Generate'}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSendAll}
            disabled={!approved_emails.length || pending}
            className="gap-1 bg-green-600 text-white hover:bg-green-700"
          >
            <Send size={14} /> Send ({approved_emails.length})
          </Button>
        )}
      </div>

      {/* Summary */}
      {emails.length > 0 && (
        <div className="flex gap-4 text-xs text-white/60">
          <span>📋 {pending_emails.length} pending approval</span>
          <span>✓ {approved_emails.length} approved</span>
        </div>
      )}

      {/* Pending emails for review */}
      {pending_emails.length > 0 && (
        <div className="space-y-2 border-t border-surface-border pt-4">
          <p className="text-xs font-medium text-white/70">Review pending emails:</p>
          {pending_emails.map((email) => (
            <div key={email.id} className="space-y-2 rounded-md border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white">To: {email.to_name} ({email.to_email})</p>
                  <p className="text-xs text-white/60">Subject: {email.subject}</p>
                </div>
                <button
                  type="button"
                  className="text-xs text-brand-primary hover:underline whitespace-nowrap"
                  onClick={() => setPreviewing(previewing === email.id ? null : email.id)}
                >
                  {previewing === email.id ? 'Hide' : 'Preview'}
                </button>
              </div>
              {previewing === email.id && (
                <div className="max-h-32 overflow-y-auto rounded bg-white/5 p-2 text-xs text-white/70 whitespace-pre-wrap">
                  {email.body}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApprove(email.id)}
                  disabled={pending}
                  className="gap-1 text-xs"
                >
                  <Check size={12} /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReject(email.id)}
                  disabled={pending}
                  className="gap-1 text-xs text-destructive hover:text-destructive"
                >
                  <X size={12} /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
