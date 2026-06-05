'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { QuickAddMenu } from './quick-add-menu'

export function TopBar() {
  const router = useRouter()
  const [q, setQ] = useState('')
  return (
    <header className="flex items-center gap-3 border-b border-surface-border bg-surface-raised/30 px-4 py-2">
      <div className="relative flex-1 max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) router.push('/search?q=' + encodeURIComponent(q.trim())) }}
          placeholder="Search contacts, companies, deals…"
          className="w-full rounded-md bg-white/5 py-1.5 pl-9 pr-3 text-sm outline-none ring-1 ring-surface-border focus:ring-brand-primary/50"
        />
      </div>
      <QuickAddMenu />
      <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-primary/20 text-sm font-medium text-brand-primary">O</div>
    </header>
  )
}
