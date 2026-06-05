import type { Stage } from './stages'
const MAP: Record<Stage, number> = {
  'Lead': 10, 'Qualified': 25, 'Discovery': 40, 'Proposal Sent': 60,
  'Negotiation': 80, 'Won': 100, 'Lost': 0,
}
export const defaultProbability = (stage: Stage): number => MAP[stage]
