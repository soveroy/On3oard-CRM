export type SuppressionEntry = {
  suppression_type: string
  value: string
  active: boolean
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function emailDomain(value: string): string {
  return normalizeEmail(value).split('@')[1] ?? ''
}

export function suppressionReason(email: string, entries: SuppressionEntry[]): string | null {
  const normalized = normalizeEmail(email)
  const domain = emailDomain(normalized)
  const match = entries.find((entry) => entry.active && (
    (entry.suppression_type === 'email' && normalizeEmail(entry.value) === normalized)
    || (entry.suppression_type === 'domain' && entry.value.trim().toLowerCase() === domain)
  ))
  return match ? `${match.suppression_type}:${match.value}` : null
}
