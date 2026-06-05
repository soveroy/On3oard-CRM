import { describe, it, expect } from 'vitest'
import { healthScore, healthColor } from '@/lib/domain/health-score'
const NOW = new Date('2026-06-05T00:00:00Z')

describe('healthScore', () => {
  it('is 100 for a fresh, on-track deal', () => {
    const s = healthScore({
      lastActivityAt: new Date('2026-06-04'), activityCount30d: 4,
      closeDate: new Date('2026-08-01'), stage: 'Discovery', probability: 40,
    }, NOW)
    expect(s).toBe(100)
  })
  it('subtracts 5 per day after 7 idle days', () => {
    const s = healthScore({
      lastActivityAt: new Date('2026-05-26'), activityCount30d: 0,
      closeDate: new Date('2026-08-01'), stage: 'Discovery', probability: 40,
    }, NOW)
    expect(s).toBe(85)
  })
  it('subtracts 10 when close date is overdue and still open', () => {
    const s = healthScore({
      lastActivityAt: new Date('2026-06-04'), activityCount30d: 4,
      closeDate: new Date('2026-05-01'), stage: 'Discovery', probability: 40,
    }, NOW)
    expect(s).toBe(90)
  })
  it('subtracts 10 when probability is misaligned with stage default', () => {
    const s = healthScore({
      lastActivityAt: new Date('2026-06-04'), activityCount30d: 4,
      closeDate: new Date('2026-08-01'), stage: 'Discovery', probability: 90,
    }, NOW)
    expect(s).toBe(90)
  })
  it('clamps to 0 and never negative', () => {
    const s = healthScore({
      lastActivityAt: null, activityCount30d: 0,
      closeDate: new Date('2020-01-01'), stage: 'Negotiation', probability: 5,
    }, NOW)
    expect(s).toBe(0)
  })
})

describe('healthColor', () => {
  it('maps score bands to colors', () => {
    expect(healthColor(80)).toBe('green')
    expect(healthColor(55)).toBe('amber')
    expect(healthColor(30)).toBe('red')
  })
})
