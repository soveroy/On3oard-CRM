import { describe, it, expect } from 'vitest'
import { defaultProbability } from '@/lib/domain/probability'
import { DEFAULT_STAGES } from '@/lib/domain/stages'
describe('defaultProbability', () => {
  it('maps each stage to its default', () => {
    expect(defaultProbability('Lead')).toBe(10)
    expect(defaultProbability('Qualified')).toBe(25)
    expect(defaultProbability('Discovery')).toBe(40)
    expect(defaultProbability('Proposal Sent')).toBe(60)
    expect(defaultProbability('Negotiation')).toBe(80)
    expect(defaultProbability('Won')).toBe(100)
    expect(defaultProbability('Lost')).toBe(0)
  })
  it('exposes ordered stages', () => {
    expect(DEFAULT_STAGES[0]).toBe('Lead')
    expect(DEFAULT_STAGES.at(-1)).toBe('Lost')
  })
})
