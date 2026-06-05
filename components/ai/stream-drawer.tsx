'use client'
import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

export function StreamDrawer({ trigger, title, endpoint, body }: {
  trigger: React.ReactNode; title: string; endpoint: string; body: Record<string, unknown>
}) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  async function run() {
    setText(''); setLoading(true)
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok || !res.body) { setText('Could not generate. Check AI configuration / sign-in.'); setLoading(false); return }
      const reader = res.body.getReader(); const dec = new TextDecoder()
      for (;;) { const { done, value } = await reader.read(); if (done) break; setText((t) => t + dec.decode(value, { stream: true })) }
    } catch { setText('Something went wrong generating this brief.') }
    setLoading(false)
  }

  return (
    <Drawer onOpenChange={(o) => { if (o) void run() }}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader><DrawerTitle>{title}</DrawerTitle></DrawerHeader>
        <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap px-4 pb-8 text-sm text-white/80">
          {text || (loading ? 'Generating…' : 'Opening…')}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
