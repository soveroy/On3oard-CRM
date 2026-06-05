'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Building2, Briefcase, CheckSquare, Mail, Settings } from 'lucide-react'
import { Logo } from '@/components/brand/logo'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/deals', label: 'Deals', icon: Briefcase },
  { href: '/activities', label: 'Activities', icon: CheckSquare },
  { href: '/campaigns', label: 'Campaigns', icon: Mail },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col gap-1 border-r border-surface-border bg-surface-raised/30 p-3">
      <div className="mb-4 flex items-center gap-2 px-2"><Logo /><span className="font-display font-semibold">On3oard</span></div>
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href)
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${active ? 'bg-brand-primary/15 text-brand-primary' : 'text-white/70 hover:bg-white/5'}`}>
            <Icon size={16} /> {label}
          </Link>
        )
      })}
    </aside>
  )
}
