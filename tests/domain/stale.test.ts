import { describe, it, expect } from 'vitest'
import { isStale } from '@/lib/domain/stale'
const NOW = new Date('2026-06-05T00:00:00Z')
describe('isStale', () => {
  it('flags deals with no activity > threshold days', () => {
    expect(isStale(new Date('2026-05-15'), NOW, 14)).toBe(true)
  })
  it('does not flag recent activity', () => {
    expect(isStale(new Date('2026-06-01'), NOW, 14)).toBe(false)
  })
  it('treats null last activity as stale', () => {
    expect(isStale(null, NOW, 14)).toBe(true)
  })
})
