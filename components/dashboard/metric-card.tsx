import Link from 'next/link'
export function MetricCard({ label, value, sub, href, danger }: { label: string; value: string; sub?: string; href?: string; danger?: boolean }) {
  const inner = (
    <div className={`rounded-lg border bg-surface-raised/30 p-4 ${danger ? 'border-[#f93f58]/40' : 'border-surface-border'}`}>
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className={`mt-1 font-display text-2xl ${danger ? 'text-[#f93f58]' : 'text-white'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-white/50">{sub}</p>}
    </div>
  )
  return href ? <Link href={href} className="block transition hover:opacity-90">{inner}</Link> : inner
}
