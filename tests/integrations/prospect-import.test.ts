import { describe, expect, it } from 'vitest'
import {
  crmIndustry,
  importRequestSchema,
  normalizeWebsite,
  prospectNotes,
  prospectTags,
  validIntegrationToken,
} from '@/lib/integrations/prospect-import'

const prospect = {
  lead_id: 'lead-1',
  company_name: 'Acme Logistics',
  website: 'https://WWW.Acme.example/?utm_source=maps',
  industry: 'logistics',
  country: 'Singapore',
  email: 'info@acme.example',
  phone: '+65 6123 4567',
  address: '1 Example Street',
  best_employee: 'aria' as const,
  best_score: 82,
  hana_score: 30,
  felix_score: 60,
  aria_score: 82,
  source_url: 'https://maps.google.com/example',
  approved_at: '2026-06-10T00:00:00+00:00',
  approval_hash: 'abc123',
  decision_makers: [{
    name: 'Jane Tan',
    role: 'Finance Manager',
    email: 'jane.tan@acme.example',
    employee: 'felix' as const,
    confidence: 95,
    evidence_url: 'https://acme.example/team',
    evidence_text: 'Jane Tan - Finance Manager',
    status: 'ready' as const,
    review_reason: '',
  }],
}

describe('prospect import contract', () => {
  it('accepts a complete approved prospect payload', () => {
    expect(importRequestSchema.safeParse({ prospects: [prospect] }).success).toBe(true)
  })

  it('rejects malformed email addresses', () => {
    expect(importRequestSchema.safeParse({
      prospects: [{ ...prospect, email: 'not-an-email' }],
    }).success).toBe(false)
  })

  it('rejects invalid decision-maker confidence', () => {
    expect(importRequestSchema.safeParse({
      prospects: [{
        ...prospect,
        decision_makers: [{ ...prospect.decision_makers[0], confidence: 101 }],
      }],
    }).success).toBe(false)
  })

  it('authenticates only the exact bearer token', () => {
    expect(validIntegrationToken('Bearer shared-secret', 'shared-secret')).toBe(true)
    expect(validIntegrationToken('Bearer wrong', 'shared-secret')).toBe(false)
    expect(validIntegrationToken(null, 'shared-secret')).toBe(false)
  })

  it('normalizes websites and maps CRM-compatible industries', () => {
    expect(normalizeWebsite(prospect.website)).toBe('https://acme.example')
    expect(crmIndustry('freight forwarding')).toBe('Logistics')
    expect(crmIndustry('accounting')).toBe('Other')
  })

  it('preserves scores and source metadata in tags and notes', () => {
    expect(prospectTags(prospect)).toContain('aria')
    expect(prospectNotes(prospect)).toContain('Hana 30, Felix 60, Aria 82')
    expect(prospectNotes(prospect)).toContain('lead-1')
  })
})
