import { describe, it, expect } from 'vitest'
import { activitySchema } from '@/lib/validation/activity'
describe('activitySchema', () => {
  it('requires a type', () => { expect(activitySchema.safeParse({ subject: 'x' }).success).toBe(false) })
  it('accepts a Call with outcome and follow-up', () => {
    const r = activitySchema.safeParse({
      type: 'Call', subject: 'Intro call', outcome: 'Positive',
      next_action: 'Send proposal', next_action_due: '2026-06-12T09:00:00Z',
    })
    expect(r.success).toBe(true)
  })
})
