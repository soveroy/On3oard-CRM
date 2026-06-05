'use client'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

// Placeholder until Phase 10 wires the streamed Claude meeting-prep brief
// into a side drawer that POSTs to /api/ai/meeting-prep.
export function MeetingPrepDrawer({ dealId }: { dealId: string }) {
  void dealId
  return (
    <Button variant="outline" disabled title="Available after the AI features phase" className="gap-2">
      <Sparkles size={15} /> Prepare for Meeting
    </Button>
  )
}
