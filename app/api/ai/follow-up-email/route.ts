import { anthropic, MODEL } from '@/lib/ai/anthropic'
import { createClient } from '@/lib/supabase/server'
import { buildFollowUpEmailPrompt } from '@/lib/ai/prompts'

export const runtime = 'nodejs'

function one<T>(v: unknown): T | null {
  return Array.isArray(v) ? ((v[0] as T) ?? null) : ((v as T) ?? null)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { activityId } = await req.json() as { activityId?: string }
  if (!activityId) return new Response('Missing activityId', { status: 400 })

  // Note: triple-nested contacts(full_name,companies(name)) is simplified to
  // contacts(full_name) to avoid hand-authored type depth issues.
  // Company name is omitted from the prompt (passed as null).
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

  try {
    const stream = anthropic.messages.stream({ model: MODEL, max_tokens: 1024, messages: [{ role: 'user', content: prompt }] })
    const encoder = new TextEncoder()
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        stream.on('text', (t: string) => controller.enqueue(encoder.encode(t)))
        stream.on('end', () => controller.close())
        stream.on('error', (e: unknown) => controller.error(e))
      },
    })
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  } catch {
    return new Response('AI generation failed. Check ANTHROPIC_API_KEY.', { status: 500 })
  }
}
