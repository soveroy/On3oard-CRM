'use client'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { StreamDrawer } from '@/components/ai/stream-drawer'

export function MeetingPrepDrawer({ dealId }: { dealId: string }) {
  return (
    <StreamDrawer
      title="Meeting prep brief"
      endpoint="/api/ai/meeting-prep"
      body={{ dealId }}
      trigger={<Button variant="outline" className="gap-2"><Sparkles size={15} /> Prepare for Meeting</Button>}
    />
  )
}
