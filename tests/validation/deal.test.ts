import { describe, it, expect } from 'vitest'
import { dealSchema } from '@/lib/validation/deal'
describe('dealSchema', () => {
  it('requires a name', () => { expect(dealSchema.safeParse({ name: '' }).success).toBe(false) })
  it('accepts a minimal valid deal', () => { expect(dealSchema.safeParse({ name: 'PNH — Full 4D' }).success).toBe(true) })
  it('coerces value and rejects negative', () => {
    expect(dealSchema.safeParse({ name: 'X', value_sgd: -5 }).success).toBe(false)
    const ok = dealSchema.safeParse({ name: 'X', value_sgd: '100800' })
    expect(ok.success).toBe(true)
    if (ok.success) expect(ok.data.value_sgd).toBe(100800)
  })
  it('rejects probability outside 0-100', () => {
    expect(dealSchema.safeParse({ name: 'X', probability: 150 }).success).toBe(false)
  })
})
