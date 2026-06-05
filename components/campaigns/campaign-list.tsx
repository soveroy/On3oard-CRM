'use client'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { shortDate } from '@/lib/format/date'
import { deleteCampaign } from '@/app/(app)/campaigns/actions'

type Campaign = { id: string; name: string; status: string; created_at: string | null; audience: string }

export function CampaignList({ campaigns, readonly = false }: { campaigns: Campaign[]; readonly?: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  function onDelete(id: string) {
    if (!confirm('Delete this draft campaign?')) return
    start(async () => {
      const res = await deleteCampaign(id)
      if (res.ok) {
        toast.success('Campaign deleted')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="space-y-2">
      {campaigns.map((c) => (
        <Link key={c.id} href={`/campaigns/${c.id}`}>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-surface-border bg-surface-raised/30 p-3 hover:bg-surface-raised/50 transition">
            <div className="min-w-0">
              <h3 className="font-medium text-white">{c.name}</h3>
              <p className="text-xs text-white/40">{c.audience} · {shortDate(c.created_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{c.status}</Badge>
              {!readonly && c.status === 'draft' && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => { e.preventDefault(); onDelete(c.id) }}
                  disabled={pending}
                  className="text-white/60 hover:text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
