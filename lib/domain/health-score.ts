import { differenceInCalendarDays } from 'date-fns'
import { defaultProbability } from './probability'
import type { Stage } from './stages'

export type HealthInput = {
  lastActivityAt: Date | string | null
  activityCount30d: number
  closeDate: Date | string | null
  stage: Stage
  probability: number
}

export function healthScore(d: HealthInput, now: Date = new Date()): number {
  let score = 100
  const idle = d.lastActivityAt ? differenceInCalendarDays(now, new Date(d.lastActivityAt)) : 30
  if (idle > 7) score -= (idle - 7) * 5
  const open = d.stage !== 'Won' && d.stage !== 'Lost'
  if (open && d.closeDate && differenceInCalendarDays(now, new Date(d.closeDate)) > 0) score -= 10
  if (Math.abs(d.probability - defaultProbability(d.stage)) > 15) score -= 10
  return Math.max(0, Math.min(100, score))
}

export type HealthColor = 'green' | 'amber' | 'red'
export const healthColor = (score: number): HealthColor =>
  score >= 67 ? 'green' : score >= 34 ? 'amber' : 'red'
