import { describe, it, expect } from 'vitest'
import { bucketTasks } from '@/lib/domain/tasks'
const NOW = new Date('2026-06-05T12:00:00Z')
describe('bucketTasks', () => {
  it('splits overdue / today / upcoming by next_action_due', () => {
    const rows = [
      { id: 'a', next_action_due: '2026-06-01T09:00:00Z' },
      { id: 'b', next_action_due: '2026-06-05T18:00:00Z' },
      { id: 'c', next_action_due: '2026-06-09T09:00:00Z' },
    ]
    const b = bucketTasks(rows, NOW)
    expect(b.overdue.map((r) => r.id)).toEqual(['a'])
    expect(b.today.map((r) => r.id)).toEqual(['b'])
    expect(b.upcoming.map((r) => r.id)).toEqual(['c'])
  })
})
