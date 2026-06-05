'use client'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function EnrichBox({ entity, onResult }: {
  entity: 'company' | 'contact'
  onResult: (data: Record<string, unknown>) => void
}) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)

  async function run() {
    if (!q.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, query: q.trim() }),
      })
      const json = await res.json().catch(() => ({})) as { data?: Record<string, unknown>; error?: string }
      if (!res.ok) { toast.error(json.error ?? 'Could not research'); return }
      onResult(json.data ?? {})
      toast.success('Filled from the web — please review before saving')
    } catch {
      toast.error('Research failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-md border border-brand-primary/30 bg-brand-primary/5 p-3">
      <div className="mb-1.5 flex items-center gap-1 text-xs font-medium text-brand-primary">
        <Sparkles size={13} /> AI autofill — researches the web and fills the form
      </div>
      <div className="flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void run() } }}
          placeholder={entity === 'company' ? 'Company name or website, e.g. Keppel' : 'Name + company, e.g. Jane Tan, Keppel'}
        />
        <Button type="button" onClick={run} disabled={loading} className="shrink-0 bg-brand-primary text-white hover:bg-brand-primary/90">
          {loading ? 'Researching…' : 'Research'}
        </Button>
      </div>
    </div>
  )
}
