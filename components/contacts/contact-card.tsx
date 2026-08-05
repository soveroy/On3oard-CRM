import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { fromNow } from '@/lib/format/date'
import { AlertCircle, Mail, Phone } from 'lucide-react'

interface ContactCardProps {
  id: string
  name: string
  company?: string
  phone?: string
  email?: string
  type?: string
  lastContacted?: string | null
  doNotContact?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function ContactCard({
  id,
  name,
  company,
  phone,
  email,
  type,
  lastContacted,
  doNotContact,
  onEdit,
  onDelete,
}: ContactCardProps) {
  return (
    <div className="border border-surface-border rounded-lg p-4 bg-surface-raised/40 hover:bg-surface-raised/60 transition-colors space-y-3">
      {/* Header: Name + Type Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-white truncate">{name}</h3>
          {company && <p className="text-sm text-white/50 truncate">{company}</p>}
        </div>
        {type && <Badge variant="secondary" className="flex-shrink-0">{type}</Badge>}
      </div>

      {/* Quick Info Row */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-1 hover:text-brand-primary transition-colors">
            <Phone size={14} className="text-white/40" />
            {phone}
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-1 hover:text-brand-primary transition-colors">
            <Mail size={14} className="text-white/40" />
            <span className="truncate">{email}</span>
          </a>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <div>
          {lastContacted && (
            <span>Last contacted: {fromNow(lastContacted)}</span>
          )}
        </div>
        {doNotContact && (
          <div className="flex items-center gap-1 text-[#f93f58]">
            <AlertCircle size={14} />
            Do Not Contact
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-surface-border/30">
        <Link href={`/contacts/${id}`} className="flex-1">
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
