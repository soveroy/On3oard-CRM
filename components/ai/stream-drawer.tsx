'use client'
import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { ModelSelect, useAiModel } from './model-select'

export function StreamDrawer({ trigger, title, endpoint, body }: {
  trigger: React.ReactNode; title: string; endpoint: string; body: Record<string, unknown>
}) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useAiModel()

  async function run(useModel: string) {
    setText(''); setLoading(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, model: useModel }),
      })
      if (!res.ok || !res.body) { setText('Could not generate. Check AI configuration / sign-in.'); setLoading(false); return }
      const reader = res.body.getReader(); const dec = new TextDecoder()
      for (;;) { const { done, value } = await reader.read(); if (done) break; setText((t) => t + dec.decode(value, { stream: true })) }
    } catch { setText('Something went wrong generating this brief.') }
    setLoading(false)
  }

  return (
    <Drawer onOpenChange={(o) => { if (o) void run(model) }}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center justify-between gap-3">
            <DrawerTitle>{title}</DrawerTitle>
            <ModelSelect value={model} onChange={(id) => { setModel(id); void run(id) }} />
          </div>
        </DrawerHeader>
        <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap px-4 pb-8 text-sm text-white/80">
          {text || (loading ? 'Generating…' : 'Opening…')}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
