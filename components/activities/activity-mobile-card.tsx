'use client'
import Link from 'next/link'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { shortDate } from '@/lib/format/date'

interface ActivityMobileCardProps {
  id: string
  type: string
  description: string | null
  dueDate: string | null
  linkedRecord: { type: 'deal' | 'contact'; id: string; name: string } | null
  status: 'pending' | 'completed' | 'overdue'
  onMarkDone?: () => void
  href: string
}

const TYPE_COLORS: Record<string, string> = {
  'Call': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Email': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Meeting': 'bg-green-500/20 text-green-400 border-green-500/30',
  'WhatsApp': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'LinkedIn Message': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'Proposal Sent': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Contract Sent': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Note': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const STATUS_COLORS: Record<string, string> = {
  'pending': 'text-blue-400',
  'overdue': 'text-red-400',
  'completed': 'text-green-400',
}

export function ActivityMobileCard({
  type,
  description,
  dueDate,
  linkedRecord,
  status,
  onMarkDone,
  href,
}: ActivityMobileCardProps) {
  const typeColor = TYPE_COLORS[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  const statusColor = STATUS_COLORS[status]
  const isCompleted = status === 'completed'

  const statusIcon = isCompleted ? (
    <CheckCircle size={20} className={statusColor} />
  ) : status === 'overdue' ? (
    <AlertCircle size={20} className={statusColor} />
  ) : (
    <Clock size={20} className={statusColor} />
  )

  return (
    <div className="border border-surface-border rounded-lg p-4 bg-surface-raised/30 space-y-3">
      {/* Header: Type + Status Icon */}
      <div className="flex items-center justify-between gap-2">
        <div className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${typeColor}`}>
          {type}
        </div>
        {statusIcon}
      </div>

      {/* Linked Record Subtitle */}
      {linkedRecord && (
        <p className="text-xs text-white/60">
          {linkedRecord.type === 'deal' ? 'Deal:' : 'Contact:'} {linkedRecord.name}
        </p>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-white line-clamp-2">{description}</p>
      )}

      {/* Due Date */}
      {dueDate && (
        <p className={`text-xs font-medium ${status === 'overdue' ? 'text-red-400' : 'text-white/50'}`}>
          Due: {shortDate(dueDate)}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-surface-border/30">
        <Link href={href} className="flex-1">
          <button className="w-full px-3 py-2 text-sm rounded-md bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary">
            View
          </button>
        </Link>
        {!isCompleted && onMarkDone && (
          <button
            onClick={onMarkDone}
            className="flex-1 px-3 py-2 text-sm rounded-md bg-green-500/20 hover:bg-green-500/30 text-green-400"
          >
            Mark Done
          </button>
        )}
      </div>
    </div>
  )
}
