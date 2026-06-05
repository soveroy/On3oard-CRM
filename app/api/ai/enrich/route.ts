import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { INDUSTRIES, COMPANY_SIZES, LEAD_SOURCES } from '@/lib/constants'

export const runtime = 'nodejs'

// Enrichment uses Claude's server-side web_search tool, so it's Anthropic-only.
const MODEL = 'claude-sonnet-4-20250514'

function extractJson(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1]! : text
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try { return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown> } catch { return null }
}

const companyPrompt = (q: string) => `Using web search, research this company and return ONLY a JSON object (no markdown, no commentary) with these keys:
{
  "name": official company name,
  "website": full https URL of the official site,
  "industry": MUST be one of ${JSON.stringify(INDUSTRIES)} — pick the closest,
  "size": one of ${JSON.stringify(COMPANY_SIZES)} (employee headcount band),
  "country": HQ country,
  "uen": Singapore UEN if the company is Singapore-registered and you find it, else "",
  "notes": a 1-2 sentence factual description of what the company does
}
Use "" for anything you cannot verify. Do not invent a website — only return one you found.
Company to research: ${q}`

const contactPrompt = (q: string) => `Using web search, research this business person and return ONLY a JSON object (no markdown, no commentary) with these keys:
{
  "full_name": their full name,
  "job_title": current job title,
  "company": current employer name,
  "linkedin_url": full LinkedIn profile URL if found, else "",
  "lead_source": one of ${JSON.stringify(LEAD_SOURCES)} (best guess, default "Inbound"),
  "notes": a 1-2 sentence professional summary
}
Only return public professional information. Do NOT invent or guess email addresses or phone numbers — omit them entirely. Use "" for anything you cannot verify.
Person to research: ${q}`

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'AI enrichment requires ANTHROPIC_API_KEY.' }, { status: 400 })
  }

  const { entity, query } = await req.json() as { entity?: 'company' | 'contact'; query?: string }
  if (!query?.trim()) return Response.json({ error: 'Enter something to research.' }, { status: 400 })
  if (entity !== 'company' && entity !== 'contact') return Response.json({ error: 'Invalid entity.' }, { status: 400 })

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      // server-side web search tool (Anthropic runs the searches and returns a synthesized answer)
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }] as never,
      messages: [{ role: 'user', content: entity === 'company' ? companyPrompt(query) : contactPrompt(query) }],
    })

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')

    const parsed = extractJson(text)
    if (!parsed) return Response.json({ error: 'Could not extract details. Try a more specific name.' }, { status: 422 })

    // Normalize / drop invalid values so the form only receives clean, saveable data.
    const data: Record<string, unknown> = { ...parsed }
    const toUrl = (v: unknown) =>
      typeof v === 'string' && v && !/^https?:\/\//i.test(v) ? `https://${v.replace(/^\/+/, '')}` : v
    if (entity === 'company') {
      if (!(INDUSTRIES as readonly string[]).includes(String(data.industry))) delete data.industry
      if (!(COMPANY_SIZES as readonly string[]).includes(String(data.size))) delete data.size
      data.website = toUrl(data.website)
    } else {
      if (!(LEAD_SOURCES as readonly string[]).includes(String(data.lead_source))) delete data.lead_source
      data.linkedin_url = toUrl(data.linkedin_url)
      delete (data as { emails?: unknown }).emails
      delete (data as { phones?: unknown }).phones
    }

    return Response.json({ data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI enrichment failed.'
    return Response.json({ error: message }, { status: 500 })
  }
}
