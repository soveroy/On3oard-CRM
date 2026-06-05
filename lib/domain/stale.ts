import { differenceInCalendarDays } from 'date-fns'
export const isStale = (lastActivityAt: Date | string | null, now: Date = new Date(), thresholdDays = 14): boolean => {
  if (!lastActivityAt) return true
  return differenceInCalendarDays(now, new Date(lastActivityAt)) > thresholdDays
}
