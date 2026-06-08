'use client'
import Link from 'next/link'
import { sgd } from '@/lib/format/currency'

interface MobileDealCardProps {
  id: string
  name: string
  value_sgd: number
  stage: string
  company: string | null
  onUpdate?: () => void
}

const STAGE_COLORS: Record<string, string> = {
  'Lead':          'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'Qualified':     'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Discovery':     'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Proposal Sent': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Negotiation':   'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Won':           'bg-green-500/20 text-green-400 border-green-500/30',
  'Lost':          'bg-red-500/20 text-red-400 border-red-500/30',
}

export function MobileDealCard({
  id,
  name,
  value_sgd,
  stage,
  company,
  onUpdate,
}: MobileDealCardProps) {
  const stageColor = STAGE_COLORS[stage] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'

  return (
    <div className="border border-surface-border rounded-lg p-4 bg-surface-raised/30 space-y-3">
      {/* Header: Name + Value */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-base text-white flex-1 line-clamp-2">{name}</h3>
        <span className="text-brand-primary font-semibold whitespace-nowrap">{sgd(value_sgd)}</span>
      </div>

      {/* Company */}
      {company && <p className="text-sm text-white/60">{company}</p>}

      {/* Stage Badge */}
      <div className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${stageColor}`}>
        {stage}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-surface-border/30">
        <Link href={`/deals/${id}`} className="flex-1">
          <button className="w-full px-3 py-2 text-sm rounded-md bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary">
            View
          </button>
        </Link>
        {onUpdate && (
          <button
            onClick={onUpdate}
            className="flex-1 px-3 py-2 text-sm rounded-md bg-surface-border hover:bg-surface-border/80 text-white"
          >
            Update
          </button>
        )}
      </div>
    </div>
  )
}
