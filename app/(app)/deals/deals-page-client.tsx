'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { KanbanBoard } from '@/components/deals/kanban-board'
import { DealListMobile } from '@/components/deals/deal-list-mobile'
import { DealQuickEditModal } from '@/components/deals/deal-quick-edit-modal'
import type { DealCardData } from '@/components/deals/deal-card'

interface Deal extends DealCardData {
  close_date: string | null
}

export function DealsPageClient({
  initialDeals,
}: {
  initialDeals: Deal[]
}) {
  const router = useRouter()
  const [editingDealId, setEditingDealId] = useState<string | null>(null)

  const editingDeal = initialDeals.find(d => d.id === editingDealId)

  const handleAddDeal = useCallback(() => {
    router.push('/deals?new=1')
  }, [router])

  const handleQuickEdit = useCallback((dealId: string) => {
    setEditingDealId(dealId)
  }, [])

  const handleCloseModal = useCallback(() => {
    setEditingDealId(null)
  }, [])

  const handleSaveModal = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <>
      {/* Desktop: Kanban board */}
      <KanbanBoard initialDeals={initialDeals} />

      {/* Mobile: Card list */}
      <div className="md:hidden">
        <DealListMobile
          deals={initialDeals}
          onAddClick={handleAddDeal}
          onQuickEdit={handleQuickEdit}
        />
      </div>

      {/* Quick-edit modal */}
      {editingDeal && (
        <DealQuickEditModal
          open={!!editingDealId}
          dealId={editingDealId!}
          currentStage={editingDeal.stage}
          currentValue={editingDeal.value_sgd}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
        />
      )}
    </>
  )
}
