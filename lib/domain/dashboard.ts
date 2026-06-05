import { DEFAULT_STAGES } from './stages'

type DealLike = { stage: string; value_sgd: number | null }
export function pipelineByStage(deals: DealLike[]) {
  return DEFAULT_STAGES.map((stage) => {
    const inStage = deals.filter((d) => d.stage === stage)
    return { stage, count: inStage.length, value: inStage.reduce((s, d) => s + (d.value_sgd ?? 0), 0) }
  })
}

const FUNNEL_ORDER = ['Lead', 'Qualified', 'Discovery', 'Proposal Sent', 'Negotiation', 'Won'] as const
export function conversionFunnel(deals: DealLike[]) {
  const idx = (s: string) => FUNNEL_ORDER.indexOf(s as (typeof FUNNEL_ORDER)[number])
  const active = deals.filter((d) => d.stage !== 'Lost')
  return FUNNEL_ORDER.map((stage, i) => ({ stage, count: active.filter((d) => idx(d.stage) >= i).length }))
}

type WonLike = { stage: string; value_sgd: number | null; stage_changed_at: string | null }
export function revenueTrend(deals: WonLike[], months = 6, now: Date = new Date()) {
  const buckets: { key: string; label: string; value: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-SG', { month: 'short' }), value: 0 })
  }
  for (const deal of deals) {
    if (deal.stage !== 'Won' || !deal.stage_changed_at) continue
    const d = new Date(deal.stage_changed_at)
    const b = buckets.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`)
    if (b) b.value += deal.value_sgd ?? 0
  }
  return buckets.map(({ label, value }) => ({ month: label, value }))
}
