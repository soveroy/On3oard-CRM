'use client'
import { useState } from 'react'
import { MobileDealCard } from './mobile-deal-card'
import { FAB } from '@/components/ui/fab'
import { Plus, TrendingUp, Calendar } from 'lucide-react'

interface Deal {
  id: string
  name: string
  value_sgd: number
  stage: string
  company: string | null
  close_date: string | null
}

interface DealListMobileProps {
  deals: Deal[]
  onAddClick: () => void
  onQuickEdit: (dealId: string) => void
  companies?: Record<string, string>
}

type SortKey = 'value' | 'date'

export function DealListMobile({
  deals,
  onAddClick,
  onQuickEdit,
}: DealListMobileProps) {
  const [sortBy, setSortBy] = useState<SortKey>('value')

  const sorted = [...deals].sort((a, b) => {
    if (sortBy === 'value') {
      return b.value_sgd - a.value_sgd
    } else {
      // Sort by date, nulls last
      if (!a.close_date && !b.close_date) return 0
      if (!a.close_date) return 1
      if (!b.close_date) return -1
      return new Date(a.close_date).getTime() - new Date(b.close_date).getTime()
    }
  })

  return (
    <div className="space-y-4 p-4 pb-20">
      {/* Sort buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('value')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
            sortBy === 'value'
              ? 'bg-brand-primary text-white'
              : 'bg-surface-border/30 text-white/70 hover:bg-surface-border/50'
          }`}
        >
          <TrendingUp size={16} />
          <span>Value</span>
        </button>
        <button
          onClick={() => setSortBy('date')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
            sortBy === 'date'
              ? 'bg-brand-primary text-white'
              : 'bg-surface-border/30 text-white/70 hover:bg-surface-border/50'
          }`}
        >
          <Calendar size={16} />
          <span>Date</span>
        </button>
      </div>

      {/* Deal List */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-center text-white/60 py-8">No deals yet</p>
        ) : (
          sorted.map(deal => (
            <MobileDealCard
              key={deal.id}
              id={deal.id}
              name={deal.name}
              value_sgd={deal.value_sgd}
              stage={deal.stage}
              company={deal.company}
              onUpdate={() => onQuickEdit(deal.id)}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <FAB icon={Plus} label="Add Deal" onClick={onAddClick} />
    </div>
  )
}
