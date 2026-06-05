import { createClient } from '@/lib/supabase/server'
import { getModel, PROVIDER_ENV } from '@/lib/ai/models'
import { resolveLanguageModel, providerConfigured } from '@/lib/ai/provider'
import { generateText } from 'ai'

export const runtime = 'nodejs'

const AUDIENCE_FILTER: Record<string, readonly string[]> = {
  prospects:  ['Prospect'] as const,
  active:     ['Active Client'] as const,
  past:       ['Past Client'] as const,
  all:        ['Prospect', 'Active Client', 'Past Client', 'Partner', 'Referrer'] as const,
}

function emailPrompt(brief: string, subjectLine: string, contact: { full_name: string; job_title: string | null; company: string | null }): string {
  return `You are On3oard's AI email writer. Brand voice: professional, warm, direct, no fluff. Never use placeholders like [NAME].

Write a ready-to-send email with this information:
- Subject: ${subjectLine}
- Recipient: ${contact.full_name}${contact.job_title ? `, ${contact.job_title}` : ''}${contact.company ? ` at ${contact.company}` : ''}
- Campaign brief: ${brief}

Format: subject line (repeat it), blank line, greeting using first name only, 2-3 short paragraphs, clear call to action, sign-off from "The On3oard Team".

Return ONLY the email body text (no JSON, no code block, no commentary).`
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { campaignId } = await req.json() as { campaignId?: string }
  if (!campaignId) return Response.json({ error: 'Missing campaignId' }, { status: 400 })

  // Load campaign
  const { data: campaign } = await supabase.from('email_campaigns').select('*').eq('id', campaignId).single()
  if (!campaign) return Response.json({ error: 'Campaign not found' }, { status: 404 })

  // Load eligible contacts (must have at least one email, not Do Not Contact)
  const types = AUDIENCE_FILTER[campaign.audience as keyof typeof AUDIENCE_FILTER] ?? AUDIENCE_FILTER['all']!
  const { data: contacts } = await supabase.from('contacts')
    .select('id,full_name,job_title,emails,companies(name)')
    .in('contact_type', types as readonly (string | null)[])
    .eq('do_not_contact', false)
    .not('emails', 'eq', '{}')

  if (!contacts?.length) {
    await supabase.from('email_campaigns').update({ status: 'review' }).eq('id', campaignId)
    return Response.json({ generated: 0, message: 'No eligible contacts found (check contact types and Do Not Contact flags)' })
  }

  // Set status → generating
  await supabase.from('email_campaigns').update({ status: 'generating' }).eq('id', campaignId)

  // Resolve the AI model
  const meta = getModel(campaign.model)
  if (!providerConfigured(meta)) {
    await supabase.from('email_campaigns').update({ status: 'draft' }).eq('id', campaignId)
    return Response.json({ error: `${meta.label} is not configured. Add ${PROVIDER_ENV[meta.provider]} to .env.local.` }, { status: 400 })
  }
  const { model: languageModel } = resolveLanguageModel(meta.id)

  // Generate emails in parallel (cap at 10 concurrent to avoid rate limits)
  const BATCH = 10
  let generated = 0

  for (let i = 0; i < contacts.length; i += BATCH) {
    const batch = contacts.slice(i, i + BATCH)
    await Promise.allSettled(batch.map(async (c) => {
      const company = Array.isArray(c.companies)
        ? (c.companies[0] as { name: string } | undefined)?.name ?? null
        : (c.companies as { name: string } | null)?.name ?? null
      const email = (c.emails ?? [])[0]
      if (!email) return
      const prompt = emailPrompt(campaign.brief, campaign.subject_line, { full_name: c.full_name, job_title: c.job_title, company })
      const { text } = await generateText({ model: languageModel, prompt })
      await supabase.from('campaign_emails').insert({
        campaign_id: campaignId,
        contact_id: c.id,
        to_name: c.full_name,
        to_email: email,
        subject: campaign.subject_line,
        body: text,
        status: 'pending',
      })
      generated++
    }))
  }

  await supabase.from('email_campaigns').update({ status: 'review' }).eq('id', campaignId)
  return Response.json({ generated })
}
