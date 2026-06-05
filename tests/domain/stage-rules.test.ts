import { describe, it, expect } from 'vitest'
import { canAdvanceStage } from '@/lib/domain/stage-rules'
describe('canAdvanceStage', () => {
  it('blocks advancing past Qualified with zero value', () => {
    expect(canAdvanceStage({ to: 'Discovery', value_sgd: 0 }).ok).toBe(false)
  })
  it('allows advancing with a value', () => {
    expect(canAdvanceStage({ to: 'Discovery', value_sgd: 100 }).ok).toBe(true)
  })
  it('requires a lost_reason when moving to Lost', () => {
    expect(canAdvanceStage({ to: 'Lost', value_sgd: 100 }).ok).toBe(false)
    expect(canAdvanceStage({ to: 'Lost', value_sgd: 100, lost_reason: 'Price' }).ok).toBe(true)
  })
})
