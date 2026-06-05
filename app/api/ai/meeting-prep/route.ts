import { anthropic, MODEL } from '@/lib/ai/anthropic'
import { createClient } from '@/lib/supabase/server'
import { buildMeetingPrepPrompt } from '@/lib/ai/prompts'

export const runtime = 'nodejs'

function one<T>(v: unknown): T | null {
  return Array.isArray(v) ? ((v[0] as T) ?? null) : ((v as T) ?? null)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { dealId } = await req.json() as { dealId?: string }
  if (!dealId) return new Response('Missing dealId', { status: 400 })

  const { data: deal } = await supabase.from('deals')
    .select('name,stage,value_sgd,engagement_type,companies(name,industry),contacts(full_name,job_title)')
    .eq('id', dealId).single()
  if (!deal) return new Response('Not found', { status: 404 })

  const { data: activities } = await supabase.from('activities')
    .select('type,subject,outcome,notes,activity_date').eq('deal_id', dealId)
    .order('activity_date', { ascending: false }).limit(10)

  const prompt = buildMeetingPrepPrompt({
    deal: { name: deal.name, stage: deal.stage, value_sgd: deal.value_sgd, engagement_type: deal.engagement_type },
    company: one<{ name: string; industry: string | null }>(deal.companies),
    contact: one<{ full_name: string; job_title: string | null }>(deal.contacts),
    activities: activities ?? [],
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
