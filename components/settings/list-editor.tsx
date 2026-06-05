'use client'
import { useState, useTransition } from 'react'
import { ArrowUp, ArrowDown, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ListEditorProps {
  title: string
  description?: string
  initial: string[]
  onSave: (items: string[]) => Promise<{ ok: boolean; error?: string }>
}

export function ListEditor({ title, description, initial, onSave }: ListEditorProps) {
  const [items, setItems] = useState<string[]>(initial)
  const [isPending, startTransition] = useTransition()

  function handleChange(index: number, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  function handleDelete(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    setItems((prev) => {
      const next = [...prev]
      const tmp = next[index - 1] as string
      next[index - 1] = next[index] as string
      next[index] = tmp
      return next
    })
  }

  function handleMoveDown(index: number) {
    if (index === items.length - 1) return
    setItems((prev) => {
      const next = [...prev]
      const tmp = next[index] as string
      next[index] = next[index + 1] as string
      next[index + 1] = tmp
      return next
    })
  }

  function handleAdd() {
    setItems((prev) => [...prev, ''])
  }

  function handleSave() {
    startTransition(async () => {
      const filtered = items.filter(Boolean)
      const result = await onSave(filtered)
      if (result.ok) {
        toast.success(`${title} saved`)
      } else {
        toast.error(result.error ?? 'Save failed')
      }
    })
  }

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-4 space-y-3">
      {description && <p className="text-sm text-white/50">{description}</p>}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="rounded p-0.5 text-white/40 hover:text-white/80 disabled:opacity-20 transition-colors"
                aria-label="Move up"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                disabled={index === items.length - 1}
                className="rounded p-0.5 text-white/40 hover:text-white/80 disabled:opacity-20 transition-colors"
                aria-label="Move down"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
            </div>
            <Input
              value={item}
              onChange={(e) => handleChange(index, e.target.value)}
              className="flex-1"
              placeholder="Enter value..."
            />
            <button
              type="button"
              onClick={() => handleDelete(index)}
              className="rounded p-1 text-white/40 hover:text-red-400 transition-colors"
              aria-label="Remove item"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAdd}
          className="gap-1.5 text-white/60 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white"
        >
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
