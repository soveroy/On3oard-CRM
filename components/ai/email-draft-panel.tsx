'use client'
import { useState } from 'react'
import { Mail, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ModelSelect, useAiModel } from './model-select'

export function EmailDraftPanel({ activityId }: { activityId: string }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useAiModel()

  async function run(useModel: string) {
    setOpen(true); setText(''); setLoading(true)
    try {
      const res = await fetch('/api/ai/follow-up-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, model: useModel }),
      })
      if (!res.ok || !res.body) { setText('Could not generate. Check AI configuration / sign-in.'); setLoading(false); return }
      const reader = res.body.getReader(); const dec = new TextDecoder()
      for (;;) { const { done, value } = await reader.read(); if (done) break; setText((t) => t + dec.decode(value, { stream: true })) }
    } catch { setText('Something went wrong.') }
    setLoading(false)
  }

  if (!open) {
    return (
      <button onClick={() => run(model)} className="mt-2 inline-flex items-center gap-1 text-xs text-brand-primary hover:underline">
        <Mail size={12} /> Draft follow-up email
      </button>
    )
  }
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">Model</span>
        <ModelSelect value={model} onChange={(id) => { setModel(id); void run(id) }} />
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
        placeholder={loading ? 'Generating…' : ''}
        className="w-full rounded-md bg-white/5 p-2 text-sm text-white/80 outline-none ring-1 ring-surface-border focus:ring-brand-primary/50" />
      <Button size="sm" variant="outline" className="gap-1" onClick={() => { void navigator.clipboard.writeText(text); toast.success('Copied to clipboard') }}>
        <Copy size={13} /> Copy
      </Button>
    </div>
  )
}
