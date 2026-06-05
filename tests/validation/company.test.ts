import { describe, it, expect } from 'vitest'
import { companySchema } from '@/lib/validation/company'
describe('companySchema', () => {
  it('requires a name', () => { expect(companySchema.safeParse({ name: '' }).success).toBe(false) })
  it('accepts a minimal valid company', () => { expect(companySchema.safeParse({ name: 'PNH Group' }).success).toBe(true) })
  it('rejects an invalid industry', () => { expect(companySchema.safeParse({ name: 'X', industry: 'Aerospace' }).success).toBe(false) })
})
