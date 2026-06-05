'use client'
import { useEffect, useState } from 'react'
import { AI_MODELS, DEFAULT_MODEL, isValidModel, PROVIDER_LABELS, type AiProvider } from '@/lib/ai/models'

const STORAGE_KEY = 'on3oard.aiModel'

/** Remembers the user's last-picked model across AI actions via localStorage. */
export function useAiModel(): [string, (id: string) => void] {
  const [model, setModel] = useState(DEFAULT_MODEL)
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (isValidModel(saved)) setModel(saved)
  }, [])
  const update = (id: string) => {
    setModel(id)
    try { window.localStorage.setItem(STORAGE_KEY, id) } catch { /* ignore */ }
  }
  return [model, update]
}

export function ModelSelect({ value, onChange, className = '' }: {
  value: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="AI model"
      className={`rounded-md bg-white/5 px-2 py-1 text-xs text-white/80 outline-none ring-1 ring-surface-border focus:ring-brand-primary/50 ${className}`}
    >
      {(Object.keys(PROVIDER_LABELS) as AiProvider[]).map((provider) => (
        <optgroup key={provider} label={PROVIDER_LABELS[provider]}>
          {AI_MODELS.filter((m) => m.provider === provider).map((m) => (
            <option key={m.id} value={m.id} className="bg-surface-raised text-white">
              {m.label} — {m.hint}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
