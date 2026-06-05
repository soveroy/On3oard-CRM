'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Tag {
  id: string
  name: string
}

interface TagsManagerProps {
  initial: Tag[]
  onCreate: (name: string) => Promise<{ ok: boolean; error?: string }>
  onDelete: (id: string) => Promise<{ ok: boolean; error?: string }>
  onMerge: (sourceId: string, targetId: string) => Promise<{ ok: boolean; error?: string }>
}

export function TagsManager({ initial, onCreate, onDelete, onMerge }: TagsManagerProps) {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>(initial)
  const [newName, setNewName] = useState('')
  const [mergeSource, setMergeSource] = useState('')
  const [mergeTarget, setMergeTarget] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    if (!newName.trim()) return
    startTransition(async () => {
      const result = await onCreate(newName.trim())
      if (result.ok) {
        toast.success('Tag created')
        setNewName('')
        router.refresh()
        // Optimistic: add a temporary placeholder (router.refresh will replace it)
        setTags((prev) => [...prev, { id: `tmp-${Date.now()}`, name: newName.trim() }])
      } else {
        toast.error(result.error ?? 'Failed to create tag')
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await onDelete(id)
      if (result.ok) {
        toast.success('Tag deleted')
        setTags((prev) => prev.filter((t) => t.id !== id))
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed to delete tag')
      }
    })
  }

  function handleMerge() {
    if (!mergeSource || !mergeTarget) return
    startTransition(async () => {
      const result = await onMerge(mergeSource, mergeTarget)
      if (result.ok) {
        toast.success('Tags merged')
        setTags((prev) => prev.filter((t) => t.id !== mergeSource))
        setMergeSource('')
        setMergeTarget('')
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed to merge tags')
      }
    })
  }

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-4 space-y-4">
      {/* Create row */}
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New tag name…"
          className="flex-1"
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
        />
        <Button
          type="button"
          size="sm"
          onClick={handleCreate}
          disabled={isPending || !newName.trim()}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white shrink-0"
        >
          Add tag
        </Button>
      </div>

      {/* Tag list */}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(tag.id)}
                disabled={isPending}
                className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
                aria-label={`Delete ${tag.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/40">No tags yet.</p>
      )}

      {/* Merge control */}
      {tags.length >= 2 && (
        <div className="border-t border-surface-border pt-3 space-y-2">
          <p className="text-xs text-white/50 font-medium">Merge tags</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={mergeSource} onValueChange={setMergeSource}>
              <SelectTrigger className="w-36 text-xs">
                <SelectValue placeholder="Source tag" />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id} className="text-xs">
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-white/40 text-sm">→</span>
            <Select value={mergeTarget} onValueChange={setMergeTarget}>
              <SelectTrigger className="w-36 text-xs">
                <SelectValue placeholder="Keep tag" />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id} className="text-xs">
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleMerge}
              disabled={isPending || !mergeSource || !mergeTarget || mergeSource === mergeTarget}
              className="text-xs"
            >
              Merge
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
