import { describe, it, expect } from 'vitest'
import { weightedValue, totalWeighted } from '@/lib/domain/weighted'
describe('weighted', () => {
  it('weights one deal by probability', () => { expect(weightedValue(100000, 40)).toBe(40000) })
  it('sums weighted across open deals only', () => {
    const deals = [
      { value_sgd: 100000, probability: 40, stage: 'Discovery' },
      { value_sgd: 50000, probability: 100, stage: 'Won' },
      { value_sgd: 20000, probability: 0, stage: 'Lost' },
    ]
    expect(totalWeighted(deals)).toBe(40000)
  })
})
