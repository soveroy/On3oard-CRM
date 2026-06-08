'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { FAB } from '@/components/ui/fab'
import { ActivityQuickForm } from './activity-quick-form'
import { createActivity } from '@/app/(app)/activities/actions'

export function QuickLogFAB() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data: { type: string; description: string; dueDate: string | null }) {
    setLoading(true)
    try {
      const payload = {
        type: data.type,
        subject: data.description,
        notes: data.description,
        next_action_due: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      }
      const result = await createActivity(payload)
      if (result.ok) {
        toast.success('Activity logged')
        setOpen(false)
        router.refresh()
      } else {
        throw new Error(('error' in result && result.error) || 'Could not log activity')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to log activity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <FAB icon={Plus} label="Quick log" onClick={() => setOpen(true)} />
      <ActivityQuickForm
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </>
  )
}
