import { describe, it, expect } from 'vitest'
import { contactSchema } from '@/lib/validation/contact'
describe('contactSchema', () => {
  it('requires full_name', () => { expect(contactSchema.safeParse({ emails: ['a@b.com'] }).success).toBe(false) })
  it('accepts name-only', () => { expect(contactSchema.safeParse({ full_name: 'Joseph Lim' }).success).toBe(true) })
  it('rejects malformed email', () => { expect(contactSchema.safeParse({ full_name: 'X', emails: ['not-an-email'] }).success).toBe(false) })
})
