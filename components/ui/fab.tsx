'use client'
import { LucideIcon } from 'lucide-react'

interface FABProps {
  icon: LucideIcon
  label?: string
  onClick: () => void
  className?: string
}

export function FAB({ icon: Icon, label, onClick, className = '' }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-20 md:static right-4
        w-14 h-14 rounded-full
        bg-brand-primary hover:bg-brand-primary/90
        text-surface-raised
        flex items-center justify-center
        shadow-lg hover:shadow-xl
        transition-shadow
        z-30
        md:hidden
        ${className}
      `}
      title={label}
      aria-label={label}
    >
      <Icon size={24} />
    </button>
  )
}
