import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { buildFollowUpEmailPrompt } from '@/lib/ai/prompts'
import { getModel, PROVIDER_ENV } from '@/lib/ai/models'
import { resolveLanguageModel, providerConfigured } from '@/lib/ai/provider'

export const runtime = 'nodejs'

function one<T>(v: unknown): T | null {
  return Array.isArray(v) ? ((v[0] as T) ?? null) : ((v as T) ?? null)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { activityId, model } = await req.json() as { activityId?: string; model?: string }
  if (!activityId) return new Response('Missing activityId', { status: 400 })

  const meta = getModel(model)
  if (!providerConfigured(meta)) {
    return new Response(`${meta.label} is not configured. Add ${PROVIDER_ENV[meta.provider]} to .env.local.`, { status: 400 })
  }

  const { data: activity } = await supabase.from('activities')
    .select('type,subject,outcome,notes,deals(stage),contacts(full_name)')
    .eq('id', activityId).single()
  if (!activity) return new Response('Not found', { status: 404 })

  const deal = one<{ stage: string | null }>(activity.deals)
  const contact = one<{ full_name: string | null }>(activity.contacts)

  const prompt = buildFollowUpEmailPrompt({
    activity: { type: activity.type, subject: activity.subject, outcome: activity.outcome, notes: activity.notes },
    contactName: contact?.full_name ?? null,
    company: null,
    dealStage: deal?.stage ?? null,
  })

  const { model: languageModel } = resolveLanguageModel(meta.id)
  const result = streamText({ model: languageModel, prompt, maxOutputTokens: 1024 })
  return result.toTextStreamResponse()
}
