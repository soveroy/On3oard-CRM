import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CampaignReview } from '@/components/campaigns/campaign-review'

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase.from('email_campaigns')
    .select('*').eq('id', id).single()
  if (!campaign) notFound()

  const { data: emails } = await supabase.from('campaign_emails')
    .select('*').eq('campaign_id', id).order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl">{campaign.name}</h1>
        <Link href="/campaigns">
          <Button variant="outline">← Back</Button>
        </Link>
      </div>

      <CampaignReview campaign={campaign} emails={emails?.filter((e) => ['pending', 'approved'].includes(e.status)) ?? []} />
    </div>
  )
}
