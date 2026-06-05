'use server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name required'),
  brief: z.string().min(10, 'Brief must be at least 10 chars'),
  subject_line: z.string().min(1, 'Subject line required'),
  audience: z.enum(['prospects', 'active', 'past', 'all']),
  model: z.string().default('claude-sonnet-4'),
})

type CreateCampaignInput = z.infer<typeof createCampaignSchema>

export async function createCampaign(input: CreateCampaignInput) {
  const parsed = createCampaignSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: 'Invalid input' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }

  const { data, error } = await supabase.from('email_campaigns').insert({
    name: parsed.data.name,
    brief: parsed.data.brief,
    subject_line: parsed.data.subject_line,
    audience: parsed.data.audience,
    model: parsed.data.model,
    created_by: user.id,
  }).select('id').single()

  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const, id: data.id }
}

export async function updateCampaignEmailStatus(emailId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }

  const { error } = await supabase.from('campaign_emails').update({ status }).eq('id', emailId)
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}

export async function deleteCampaign(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }

  const { error } = await supabase.from('email_campaigns').delete().eq('id', campaignId)
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}
