import { describe, it, expect } from 'vitest'
import { pipelineByStage, conversionFunnel } from '@/lib/domain/dashboard'
const deals = [
  { stage: 'Lead', value_sgd: 1000 }, { stage: 'Lead', value_sgd: 2000 },
  { stage: 'Discovery', value_sgd: 5000 }, { stage: 'Won', value_sgd: 9000 },
]
describe('dashboard reducers', () => {
  it('groups count and value by stage', () => {
    const r = pipelineByStage(deals)
    expect(r.find((s) => s.stage === 'Lead')).toMatchObject({ count: 2, value: 3000 })
    expect(r.find((s) => s.stage === 'Discovery')).toMatchObject({ count: 1, value: 5000 })
  })
  it('computes funnel drop-off as cumulative reach', () => {
    const f = conversionFunnel(deals)
    expect(f[0]!.stage).toBe('Lead')
    expect(f[0]!.count).toBeGreaterThanOrEqual(f[f.length - 1]!.count)
  })
})
