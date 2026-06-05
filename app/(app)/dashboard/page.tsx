import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { totalWeighted } from '@/lib/domain/weighted'
import { OPEN_STAGES } from '@/lib/domain/stages'
import { pipelineByStage, conversionFunnel, revenueTrend } from '@/lib/domain/dashboard'
import { bucketTasks } from '@/lib/domain/tasks'
import { sgd } from '@/lib/format/currency'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/dashboard/metric-card'
import { PipelineBar } from '@/components/dashboard/pipeline-bar'
import { RevenueTrend } from '@/components/dashboard/revenue-trend'
import { ConversionFunnel } from '@/components/dashboard/conversion-funnel'
import { TopDeals, type TopDeal } from '@/components/dashboard/top-deals'
import { RecentActivity } from '@/components/dashboard/recent-activity'

function oneName(v: unknown): string | null {
  if (Array.isArray(v)) return (v[0] as { name?: string })?.name ?? null
  return (v as { name?: string } | null)?.name ?? null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: deals } = await supabase.from('deals')
    .select('id,name,stage,value_sgd,probability,close_date,stage_changed_at,companies(name)')
  const { data: pending } = await supabase.from('activities').select('id,next_action_due').not('next_action_due', 'is', null)
  const { data: recent } = await supabase.from('activities').select('id,type,subject,activity_date').order('activity_date', { ascending: false }).limit(10)

  const ds = deals ?? []
  const now = new Date()
  const openSet = OPEN_STAGES as readonly string[]
  const open = ds.filter((d) => openSet.includes(d.stage))
  const openPipeline = totalWeighted(ds.map((d) => ({ value_sgd: d.value_sgd ?? 0, probability: d.probability ?? 0, stage: d.stage })))
  const won = ds.filter((d) => d.stage === 'Won' && d.stage_changed_at && new Date(d.stage_changed_at).getMonth() === now.getMonth() && new Date(d.stage_changed_at).getFullYear() === now.getFullYear())
  const wonValue = won.reduce((s, d) => s + (d.value_sgd ?? 0), 0)
  const proposal = ds.filter((d) => d.stage === 'Proposal Sent')
  const proposalValue = proposal.reduce((s, d) => s + (d.value_sgd ?? 0), 0)
  const overdueCount = bucketTasks(pending ?? [], now).overdue.length

  const topOpen: TopDeal[] = [...open]
    .sort((a, b) => (b.value_sgd ?? 0) - (a.value_sgd ?? 0))
    .slice(0, 5)
    .map((d) => ({ id: d.id, name: d.name, company: oneName(d.companies), value_sgd: d.value_sgd ?? 0, close_date: d.close_date, stage: d.stage }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/contacts?new=1">+ Add Contact</Link></Button>
          <Button asChild variant="outline"><Link href="/deals?new=1">+ Add Deal</Link></Button>
          <Button asChild><Link href="/activities?new=1">+ Log Activity</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Open pipeline (weighted)" value={sgd(openPipeline)} sub={`${open.length} open deals`} />
        <MetricCard label="Won this month" value={sgd(wonValue)} sub={`${won.length} deals`} />
        <MetricCard label="In proposal" value={sgd(proposalValue)} sub={`${proposal.length} deals`} />
        <MetricCard label="Overdue follow-ups" value={String(overdueCount)} href="/activities" danger={overdueCount > 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PipelineBar data={pipelineByStage(ds)} />
        <RevenueTrend data={revenueTrend(ds, 6, now)} />
        <ConversionFunnel data={conversionFunnel(ds)} />
        <TopDeals deals={topOpen} />
      </div>

      <RecentActivity activities={recent ?? []} />
    </div>
  )
}
