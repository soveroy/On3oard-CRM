import Link from 'next/link'

interface ContactCardProps {
  id: string
  name: string
  company?: string
  phone?: string
  email?: string
  onEdit?: () => void
  onDelete?: () => void
}

export function ContactCard({
  id,
  name,
  company,
  phone,
  email,
  onEdit,
  onDelete,
}: ContactCardProps) {
  return (
    <div className="border border-surface-border rounded-lg p-4 bg-surface-raised/30 space-y-3">
      {/* Header: Name + Company */}
      <div>
        <h3 className="font-semibold text-base text-white">{name}</h3>
        {company && <p className="text-sm text-white/60">{company}</p>}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 text-sm">
        {phone && (
          <p className="flex items-center gap-2">
            <span className="text-white/40">Phone:</span>
            <a href={`tel:${phone}`} className="text-brand-primary hover:underline">
              {phone}
            </a>
          </p>
        )}
        {email && (
          <p className="flex items-center gap-2">
            <span className="text-white/40">Email:</span>
            <a href={`mailto:${email}`} className="text-brand-primary hover:underline">
              {email}
            </a>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-surface-border/30">
        <Link href={`/contacts/${id}`} className="flex-1">
          <button className="w-full px-3 py-2 text-sm rounded-md bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary">
            View
          </button>
        </Link>
        {onEdit && (
          <button onClick={onEdit} className="flex-1 px-3 py-2 text-sm rounded-md bg-surface-border hover:bg-surface-border/80 text-white">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="flex-1 px-3 py-2 text-sm rounded-md bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent">
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
