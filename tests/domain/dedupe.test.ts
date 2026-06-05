import { describe, it, expect } from 'vitest'
import { findDuplicateEmail } from '@/lib/domain/dedupe'
describe('findDuplicateEmail', () => {
  it('matches case-insensitively', () => {
    const existing = [{ id: '1', emails: ['Joseph@PNH.com.sg'] }]
    expect(findDuplicateEmail(existing, ['joseph@pnh.com.sg'])).toBe('1')
  })
  it('returns null when no overlap', () => {
    expect(findDuplicateEmail([{ id: '1', emails: ['a@b.com'] }], ['c@d.com'])).toBeNull()
  })
})
