import { type ReactNode } from 'react'
export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-lg border border-surface-border bg-surface-raised/40 py-16 text-center">
      <p className="font-display text-lg text-white">{title}</p>
      {hint && <p className="mt-1 text-sm text-white/50">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
