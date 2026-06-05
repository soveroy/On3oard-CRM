'use client'
import { useDroppable } from '@dnd-kit/core'
import { sgd } from '@/lib/format/currency'
import { DealCard, type DealCardData } from './deal-card'

export function KanbanColumn({ stage, deals }: { stage: string; deals: DealCardData[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const total = deals.reduce((s, d) => s + d.value_sgd, 0)
  return (
    <div ref={setNodeRef} className={`flex w-64 shrink-0 flex-col rounded-lg border border-surface-border bg-surface-raised/20 ${isOver ? 'ring-1 ring-brand-primary/60' : ''}`}>
      <div className="flex items-center justify-between border-b border-surface-border px-3 py-2">
        <span className="text-sm font-medium">{stage}</span>
        <span className="text-xs text-white/40">{deals.length} · {sgd(total)}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">
        {deals.map((d) => <DealCard key={d.id} deal={d} />)}
      </div>
    </div>
  )
}
