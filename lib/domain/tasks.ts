type Row = { id: string; next_action_due: string | null }

/** Compare dates by UTC calendar day (YYYY-MM-DD). Avoids local-TZ shifts. */
function utcDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function bucketTasks<T extends Row>(rows: T[], now: Date = new Date()) {
  const today: T[] = [], overdue: T[] = [], upcoming: T[] = []
  const nowDay = utcDay(now)
  for (const r of rows) {
    if (!r.next_action_due) continue
    const due = new Date(r.next_action_due)
    const dueDay = utcDay(due)
    if (dueDay === nowDay) today.push(r)
    else if (dueDay < nowDay) overdue.push(r)
    else upcoming.push(r)
  }
  return { overdue, today, upcoming }
}
