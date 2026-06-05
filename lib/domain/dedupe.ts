type C = { id: string; emails: string[] }
export function findDuplicateEmail(existing: C[], incoming: string[]): string | null {
  const set = new Set(incoming.map((e) => e.toLowerCase()))
  for (const c of existing) {
    if (c.emails.some((e) => set.has(e.toLowerCase()))) return c.id
  }
  return null
}
