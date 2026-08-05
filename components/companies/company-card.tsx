import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { sgd } from '@/lib/format/currency'
import { Users, Briefcase } from 'lucide-react'

interface CompanyCardProps {
  id: string
  name: string
  industry?: string | null
  size?: string | null
  contactCount: number
  dealCount: number
  totalValue: number
  onEdit?: () => void
  onDelete?: () => void
}

export function CompanyCard({
  id,
  name,
  industry,
  size,
  contactCount,
  dealCount,
  totalValue,
  onEdit,
  onDelete,
}: CompanyCardProps) {
  return (
    <div className="border border-surface-border rounded-lg p-4 bg-surface-raised/40 hover:bg-surface-raised/60 transition-colors space-y-3">
      {/* Header: Name + Industry Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-white truncate">{name}</h3>
          {size && <p className="text-sm text-white/50 truncate">{size}</p>}
        </div>
        {industry && <Badge variant="secondary" className="flex-shrink-0">{industry}</Badge>}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 py-2 border-y border-surface-border/30">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-brand-primary" />
          <div>
            <p className="text-xs text-white/50">Contacts</p>
            <p className="text-sm font-semibold text-white">{contactCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-brand-primary" />
          <div>
            <p className="text-xs text-white/50">Deals</p>
            <p className="text-sm font-semibold text-white">{dealCount}</p>
          </div>
        </div>
      </div>

      {/* Total Value */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">Total deal value</span>
        <span className="font-semibold text-brand-primary">{sgd(totalValue)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-surface-border/30">
        <Link href={`/companies/${id}`} className="flex-1">
          <button className="w-full px-3 py-2 text-sm rounded-md bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary font-medium transition-colors">
            View
          </button>
        </Link>
        {onEdit && (
          <button onClick={onEdit} className="flex-1 px-3 py-2 text-sm rounded-md bg-white/5 hover:bg-white/10 text-white/80 font-medium transition-colors">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="flex-1 px-3 py-2 text-sm rounded-md bg-[#f93f58]/10 hover:bg-[#f93f58]/20 text-[#f93f58] font-medium transition-colors">
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
