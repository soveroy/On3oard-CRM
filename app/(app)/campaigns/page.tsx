import { createClient } from '@/lib/supabase/server'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from '@/components/ui/button'
import { CreateCampaignForm } from '@/components/campaigns/create-campaign-form'
import { CampaignList } from '@/components/campaigns/campaign-list'
import { CampaignReview } from '@/components/campaigns/campaign-review'

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Load all campaigns
  const { data: campaigns } = await supabase.from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  // Load all pending/approved emails
  const { data: allEmails } = await supabase.from('campaign_emails')
    .select('*')
    .in('status', ['pending', 'approved'])
    .order('created_at', { ascending: false })

  const draftCampaigns = campaigns?.filter((c) => c.status === 'draft') ?? []
  const reviewCampaigns = campaigns?.filter((c) => c.status === 'review') ?? []
  const sentCampaigns = campaigns?.filter((c) => c.status === 'sent') ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Campaigns</h1>
      </div>

      {/* If no campaigns exist, show the create form prominently */}
      {!campaigns?.length ? (
        <div className="space-y-4">
          <p className="text-sm text-white/60">No campaigns yet. Create your first one:</p>
          <CreateCampaignForm />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Draft campaigns */}
          {draftCampaigns.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-white/70">📝 Draft ({draftCampaigns.length})</h2>
              <CampaignList campaigns={draftCampaigns} />
            </section>
          )}

          {/* Review campaigns with email approval queue */}
          {reviewCampaigns.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-white/70">⏳ Ready to send ({reviewCampaigns.length})</h2>
              {reviewCampaigns.map((campaign) => (
                <CampaignReview key={campaign.id} campaign={campaign} emails={allEmails?.filter((e) => e.campaign_id === campaign.id) ?? []} />
              ))}
            </section>
          )}

          {/* Sent campaigns (read-only) */}
          {sentCampaigns.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-white/70">✓ Sent ({sentCampaigns.length})</h2>
              <CampaignList campaigns={sentCampaigns} readonly />
            </section>
          )}

          {/* New campaign button */}
          <div className="border-t border-surface-border pt-6">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-brand-primary hover:underline">+ New campaign</summary>
              <div className="mt-4"><CreateCampaignForm /></div>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}
