import { type ReactNode } from 'react'
export function ErrorState({ title = 'Something went wrong', hint, action }: { title?: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-lg border border-[#f93f58]/30 bg-[#f93f58]/5 py-16 text-center">
      <p className="font-display text-lg text-[#f93f58]">{title}</p>
      {hint && <p className="mt-1 text-sm text-white/50">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
