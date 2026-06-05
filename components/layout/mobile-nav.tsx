'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Building2, Briefcase, CheckSquare, Settings } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/deals', label: 'Deals', icon: Briefcase },
  { href: '/activities', label: 'Tasks', icon: CheckSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex justify-around border-t border-surface-border bg-surface-raised/95 py-2 md:hidden">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href)
        return (
          <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 text-[10px] ${active ? 'text-brand-primary' : 'text-white/60'}`}>
            <Icon size={18} /> {label}
          </Link>
        )
      })}
    </nav>
  )
}
