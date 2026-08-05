import { describe, expect, it } from 'vitest'
import { suppressionReason } from '@/lib/integrations/suppression'

describe('suppression registry', () => {
  const entries = [
    { suppression_type: 'email', value: 'blocked@example.com', active: true },
    { suppression_type: 'domain', value: 'invalid.example', active: true },
    { suppression_type: 'email', value: 'inactive@example.com', active: false },
  ]

  it('matches normalized emails and domains', () => {
    expect(suppressionReason(' BLOCKED@example.com ', entries)).toBe('email:blocked@example.com')
    expect(suppressionReason('any@invalid.example', entries)).toBe('domain:invalid.example')
  })

  it('ignores inactive entries', () => {
    expect(suppressionReason('inactive@example.com', entries)).toBeNull()
  })
})
