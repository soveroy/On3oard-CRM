import type { Stage } from './stages'

const VALUE_REQUIRED_FROM: Stage[] = ['Discovery', 'Proposal Sent', 'Negotiation', 'Won']

export function canAdvanceStage(input: { to: Stage; value_sgd: number; lost_reason?: string }):
  { ok: true } | { ok: false; reason: string } {
  if (input.to === 'Lost' && !input.lost_reason) return { ok: false, reason: 'A lost reason is required.' }
  if (VALUE_REQUIRED_FROM.includes(input.to) && (!input.value_sgd || input.value_sgd <= 0))
    return { ok: false, reason: 'Set a deal value before advancing past Qualified.' }
  return { ok: true }
}
