'use client'
import { useDraggable } from '@dnd-kit/core'
import Link from 'next/link'
import { sgd } from '@/lib/format/currency'
import { shortDate } from '@/lib/format/date'
import { HealthDot } from './health-dot'

export type DealCardData = {
  id: string
  name: string
  company: string | null
  value_sgd: number
  close_date: string | null
  priority: string
  stage: string
  health: number
  stale: boolean
}

export function DealCard({ deal }: { deal: DealCardData }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  return (
    <div
      ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={`cursor-grab rounded-md border border-surface-border bg-surface-raised/60 p-3 text-sm ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/deals/${deal.id}`} className="font-medium text-white hover:text-brand-primary" onClick={(e) => e.stopPropagation()}>
          {deal.name}
        </Link>
        <HealthDot score={deal.health} />
      </div>
      {deal.company && <p className="mt-0.5 text-xs text-white/50">{deal.company}</p>}
      <div className="mt-2 flex items-center justify-between text-xs text-white/60">
        <span className="font-medium text-brand-primary">{sgd(deal.value_sgd)}</span>
        <span>{shortDate(deal.close_date)}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40">
        <span>{deal.priority}</span>
        {deal.stale && <span className="rounded bg-[#f93f58]/15 px-1.5 py-0.5 text-[#f93f58]">stale</span>}
      </div>
    </div>
  )
}
