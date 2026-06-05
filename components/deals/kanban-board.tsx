'use client'
import { useState } from 'react'
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DEFAULT_STAGES, type Stage } from '@/lib/domain/stages'
import { KanbanColumn } from './kanban-column'
import { LostReasonDialog } from './lost-reason-dialog'
import { moveDealStage } from '@/app/(app)/deals/actions'
import type { DealCardData } from './deal-card'

export function KanbanBoard({ initialDeals }: { initialDeals: DealCardData[] }) {
  const router = useRouter()
  const [deals, setDeals] = useState(initialDeals)
  const [pendingLost, setPendingLost] = useState<{ id: string; from: Stage } | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  async function commitMove(id: string, from: Stage, to: Stage, lostReason?: string) {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage: to } : d)))
    const res = await moveDealStage(id, to, lostReason ? { lostReason } : undefined)
    if (!res.ok) {
      setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage: from } : d)))
      toast.error(res.error ?? 'Could not move deal')
    } else {
      toast.success(`Moved to ${to}`)
      router.refresh()
    }
  }

  function onDragEnd(e: DragEndEvent) {
    const id = String(e.active.id)
    const to = (e.over?.id as Stage | undefined)
    if (!to) return
    const deal = deals.find((d) => d.id === id)
    if (!deal || deal.stage === to) return
    const from = deal.stage as Stage
    if (to === 'Lost') { setPendingLost({ id, from }); return }
    void commitMove(id, from, to)
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {DEFAULT_STAGES.map((stage) => (
            <KanbanColumn key={stage} stage={stage} deals={deals.filter((d) => d.stage === stage)} />
          ))}
        </div>
      </DndContext>
      <LostReasonDialog
        open={!!pendingLost}
        onCancel={() => setPendingLost(null)}
        onConfirm={(reason) => { if (pendingLost) void commitMove(pendingLost.id, pendingLost.from, 'Lost' as Stage, reason); setPendingLost(null) }}
      />
    </>
  )
}
