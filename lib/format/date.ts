import { format, formatDistanceToNowStrict, isPast } from 'date-fns'
export const shortDate = (d: string | Date | null) => (d ? format(new Date(d), 'd MMM yyyy') : '—')
export const fromNow = (d: string | Date) => formatDistanceToNowStrict(new Date(d), { addSuffix: true })
export const overdue = (d: string | Date | null) => (d ? isPast(new Date(d)) : false)
