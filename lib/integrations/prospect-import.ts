import { createHash, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

export const decisionMakerSchema = z.object({
  name: z.string().max(200).default(''),
  role: z.string().min(1).max(200),
  email: z.string().email().or(z.literal('')).default(''),
  employee: z.enum(['hana', 'felix', 'aria', 'all']).default('all'),
  confidence: z.number().int().min(0).max(100),
  evidence_url: z.string().url().or(z.literal('')).default(''),
  evidence_text: z.string().max(1000).default(''),
  status: z.enum(['ready', 'needs_review', 'rejected']),
  review_reason: z.string().max(500).default(''),
})

export const prospectSchema = z.object({
  lead_id: z.string().min(1).max(128),
  company_name: z.string().min(1).max(300),
  website: z.string().url().or(z.literal('')).default(''),
  industry: z.string().max(100).default(''),
  country: z.string().max(100).default('Singapore'),
  email: z.string().email(),
  phone: z.string().max(100).default(''),
  address: z.string().max(500).default(''),
  best_employee: z.enum(['hana', 'felix', 'aria']),
  best_score: z.number().int().min(0).max(100),
  hana_score: z.number().int().min(0).max(100),
  felix_score: z.number().int().min(0).max(100),
  aria_score: z.number().int().min(0).max(100),
  source_url: z.string().url().or(z.literal('')).default(''),
  approved_at: z.string().datetime({ offset: true }).or(z.literal('')).default(''),
  approval_hash: z.string().min(1).max(128),
  decision_makers: z.array(decisionMakerSchema).max(25).default([]),
})

export const importRequestSchema = z.object({
  prospects: z.array(prospectSchema).min(1).max(100),
})

export type ProspectImport = z.infer<typeof prospectSchema>

export function validIntegrationToken(authorization: string | null, expected: string | undefined): boolean {
  if (!expected || !authorization?.startsWith('Bearer ')) return false
  const supplied = authorization.slice(7)
  const suppliedHash = createHash('sha256').update(supplied).digest()
  const expectedHash = createHash('sha256').update(expected).digest()
  return timingSafeEqual(suppliedHash, expectedHash)
}

export function normalizeWebsite(value: string): string {
  if (!value) return ''
  const url = new URL(value)
  url.hash = ''
  url.search = ''
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  url.pathname = url.pathname === '/' ? '' : url.pathname.replace(/\/+$/, '')
  return url.toString().replace(/\/$/, '')
}

export function crmIndustry(value: string): 'FM' | 'Marine' | 'Healthcare' | 'Education' | 'F&B' | 'Logistics' | 'Other' {
  const normalized = value.toLowerCase()
  if (normalized.includes('health')) return 'Healthcare'
  if (normalized.includes('logistic') || normalized.includes('freight') || normalized.includes('warehouse')) return 'Logistics'
  if (normalized.includes('marine') || normalized.includes('shipping')) return 'Marine'
  if (normalized.includes('education') || normalized.includes('training')) return 'Education'
  if (normalized.includes('food') || normalized.includes('restaurant') || normalized.includes('f&b')) return 'F&B'
  if (normalized.includes('facility') || normalized === 'fm') return 'FM'
  return 'Other'
}

export function prospectTags(prospect: ProspectImport): string[] {
  return [
    'prospect-engine',
    prospect.best_employee,
    `score-${prospect.best_score}`,
    prospect.industry || 'unclassified',
  ]
}

export function prospectNotes(prospect: ProspectImport): string {
  return [
    `Imported from On3oard Prospect Engine lead ${prospect.lead_id}.`,
    `Digital employee fit: ${prospect.best_employee} (${prospect.best_score}).`,
    `Scores: Hana ${prospect.hana_score}, Felix ${prospect.felix_score}, Aria ${prospect.aria_score}.`,
    prospect.address ? `Address: ${prospect.address}.` : '',
    prospect.source_url ? `Discovery source: ${prospect.source_url}.` : '',
    prospect.approved_at ? `Approved at: ${prospect.approved_at}.` : '',
    `Approval hash: ${prospect.approval_hash}.`,
  ].filter(Boolean).join('\n')
}
