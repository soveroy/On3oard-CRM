import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import type { Database, Json } from '@/lib/supabase/types'
import {
  crmIndustry,
  importRequestSchema,
  normalizeWebsite,
  prospectNotes,
  prospectTags,
  type ProspectImport,
  validIntegrationToken,
} from '@/lib/integrations/prospect-import'

export const runtime = 'nodejs'

type ImportAction = 'created' | 'updated' | 'duplicate' | 'rejected'
type ImportResult = {
  lead_id: string
  action: ImportAction
  company_id?: string
  contact_id?: string
  contact_count?: number
  reason?: string
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object') {
    const value = error as { message?: unknown; details?: unknown; code?: unknown }
    const parts = [value.message, value.details, value.code]
      .filter((part): part is string => typeof part === 'string' && Boolean(part))
    if (parts.length) return parts.join(' | ')
  }
  return 'Unknown import error.'
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('CRM Supabase service configuration is incomplete.')
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function contentHash(prospect: ProspectImport): string {
  return createHash('sha256').update(JSON.stringify({ schema_version: 3, prospect })).digest('hex')
}

function contactKey(prospect: ProspectImport, name: string, role: string, email: string): string {
  return createHash('sha256')
    .update([prospect.lead_id, name.toLowerCase(), role.toLowerCase(), email.toLowerCase()].join('|'))
    .digest('hex')
    .slice(0, 32)
}

async function importProspect(
  supabase: ReturnType<typeof serviceClient>,
  prospect: ProspectImport,
): Promise<ImportResult> {
  const hash = contentHash(prospect)
  const { data: prior, error: priorError } = await supabase
    .from('prospect_imports')
    .select('company_id,contact_id,content_hash')
    .eq('source_system', 'on3oard-prospect-engine')
    .eq('source_lead_id', prospect.lead_id)
    .maybeSingle()
  if (priorError) throw priorError
  if (prior?.content_hash === hash) {
    return {
      lead_id: prospect.lead_id,
      action: 'duplicate',
      company_id: prior.company_id ?? undefined,
      contact_id: prior.contact_id ?? undefined,
    }
  }

  const website = normalizeWebsite(prospect.website)
  let companyQuery = supabase.from('companies').select('id,name,website,notes,tags')
  companyQuery = website
    ? companyQuery.eq('website', website)
    : companyQuery.ilike('name', prospect.company_name)
  const { data: companyRows, error: companyLookupError } = await companyQuery.limit(1)
  if (companyLookupError) throw companyLookupError

  const companyPayload = {
    name: prospect.company_name,
    website: website || null,
    industry: crmIndustry(prospect.industry),
    country: prospect.country || 'Singapore',
    address: prospect.address || null,
    discovery_source_url: prospect.source_url || null,
    tags: prospectTags(prospect),
    notes: prospectNotes(prospect),
  }
  let companyId = companyRows?.[0]?.id
  let created = false
  if (companyId) {
    const { error } = await supabase.from('companies').update(companyPayload).eq('id', companyId)
    if (error) throw error
  } else {
    const { data, error } = await supabase.from('companies').insert(companyPayload).select('id').single()
    if (error) throw error
    companyId = data.id
    created = true
  }

  const importedContacts = prospect.decision_makers.length
    ? prospect.decision_makers
    : [{
        name: '',
        role: 'Business Contact',
        email: prospect.email,
        employee: prospect.best_employee,
        confidence: 45,
        evidence_url: prospect.source_url,
        evidence_text: 'Public company contact address; no named decision-maker verified.',
        status: 'needs_review' as const,
        review_reason: 'Generic company inbox requires human review before outreach.',
      }]
  let contactId: string | undefined
  let contactCount = 0
  for (const decisionMaker of importedContacts) {
    const email = decisionMaker.email.trim().toLowerCase()
    const key = contactKey(prospect, decisionMaker.name, decisionMaker.role, email)
    let contactQuery = supabase
      .from('contacts')
      .select('id,do_not_contact,full_name')
      .eq('prospect_contact_key', key)
    const { data: keyedContact, error: keyedContactError } = await contactQuery.maybeSingle()
    if (keyedContactError) throw keyedContactError

    let contact = keyedContact
    if (!contact && email) {
      const { data: emailRows, error: emailLookupError } = await supabase
        .from('contacts')
        .select('id,do_not_contact,full_name')
        .contains('emails', [email])
        .limit(1)
      if (emailLookupError) throw emailLookupError
      contact = emailRows?.[0] ?? null
    }
    if (!contact && contactCount === 0) {
      const { data: legacyRows, error: legacyLookupError } = await supabase
        .from('contacts')
        .select('id,do_not_contact,full_name')
        .eq('prospect_lead_id', prospect.lead_id)
        .ilike('full_name', 'Team at %')
        .limit(1)
      if (legacyLookupError) throw legacyLookupError
      contact = legacyRows?.[0] ?? null
    }
    if (contact?.do_not_contact) {
      throw new Error(`Existing CRM contact ${contact.full_name} is marked do not contact.`)
    }

    const contactPayload = {
      full_name: decisionMaker.name || `Team at ${prospect.company_name}`,
      job_title: decisionMaker.role || null,
      company_id: companyId,
      emails: email ? [email] : [],
      phones: prospect.phone && contactCount === 0 ? [prospect.phone] : [],
      lead_source: 'Cold Outreach',
      contact_type: 'Prospect',
      prospect_lead_id: prospect.lead_id,
      prospect_contact_key: key,
      decision_employee: decisionMaker.employee,
      decision_confidence: decisionMaker.confidence,
      decision_evidence_url: decisionMaker.evidence_url || null,
      decision_evidence_text: decisionMaker.evidence_text || null,
      decision_status: decisionMaker.status,
      decision_review_reason: decisionMaker.review_reason || null,
      best_employee: prospect.best_employee,
      best_score: prospect.best_score,
      hana_score: prospect.hana_score,
      felix_score: prospect.felix_score,
      aria_score: prospect.aria_score,
      prospect_approved_at: prospect.approved_at || null,
      prospect_approval_hash: prospect.approval_hash,
      prospect_synced_at: new Date().toISOString(),
      tags: [...prospectTags(prospect), `contact-${decisionMaker.status}`],
      notes: [
        prospectNotes(prospect),
        decisionMaker.evidence_url ? `Decision-maker evidence: ${decisionMaker.evidence_url}` : '',
        decisionMaker.review_reason,
      ].filter(Boolean).join('\n'),
    }
    if (contact?.id) {
      const { error } = await supabase.from('contacts').update(contactPayload).eq('id', contact.id)
      if (error) throw error
      contactId ??= contact.id
    } else {
      const { data, error } = await supabase.from('contacts').insert(contactPayload).select('id').single()
      if (error) throw error
      contactId ??= data.id
      created = true
    }
    contactCount++
  }

  const action: ImportAction = prior ? 'updated' : created ? 'created' : 'updated'
  const ledgerPayload = {
    source_system: 'on3oard-prospect-engine',
    source_lead_id: prospect.lead_id,
    company_id: companyId,
    contact_id: contactId,
    action,
    content_hash: hash,
    metadata: prospect as unknown as Json,
    error: null,
    imported_at: new Date().toISOString(),
  }
  const { error: ledgerError } = await supabase
    .from('prospect_imports')
    .upsert(ledgerPayload, { onConflict: 'source_system,source_lead_id' })
  if (ledgerError) throw ledgerError

  return {
    lead_id: prospect.lead_id,
    action,
    company_id: companyId,
    contact_id: contactId,
    contact_count: contactCount,
  }
}

export async function POST(request: Request) {
  if (!validIntegrationToken(request.headers.get('authorization'), process.env.CRM_INTEGRATION_TOKEN)) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }
  const parsed = importRequestSchema.safeParse(payload)
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: 'Invalid prospect payload.', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const supabase = serviceClient()
  const results: ImportResult[] = []
  for (const prospect of parsed.data.prospects) {
    try {
      results.push(await importProspect(supabase, prospect))
    } catch (error) {
      results.push({
        lead_id: prospect.lead_id,
        action: 'rejected',
        reason: errorMessage(error),
      })
    }
  }
  const counts = results.reduce(
    (totals, result) => ({ ...totals, [result.action]: totals[result.action] + 1 }),
    { created: 0, updated: 0, duplicate: 0, rejected: 0 },
  )
  return Response.json({ ok: counts.rejected === 0, counts, results })
}
