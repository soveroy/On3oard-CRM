import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DndContext } from '@dnd-kit/core'
import { DealCard } from '@/components/deals/deal-card'
describe('DealCard', () => {
  it('renders company, name and formatted value', () => {
    render(
      <DndContext>
        <DealCard deal={{ id: '1', name: 'PNH — Full 4D', company: 'PNH Group', value_sgd: 100800, close_date: '2025-09-30', priority: 'High', stage: 'Discovery', health: 80, stale: false }} />
      </DndContext>,
    )
    expect(screen.getByText('PNH — Full 4D')).toBeInTheDocument()
    expect(screen.getByText('PNH Group')).toBeInTheDocument()
    expect(screen.getByText('$100,800')).toBeInTheDocument()
  })
})
