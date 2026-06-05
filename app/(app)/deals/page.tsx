import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KanbanBoard } from '@/components/deals/kanban-board'
import { DealList } from '@/components/deals/deal-list'
import { DealForm } from '@/components/deals/deal-form'
import { EmptyState } from '@/components/brand/empty-state'
import { healthScore } from '@/lib/domain/health-score'
import { isStale } from '@/lib/domain/stale'
import type { Stage } from '@/lib/domain/stages'
import type { DealCardData } from '@/components/deals/deal-card'

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const { new: isNew } = await searchParams
  const supabase = await createClient()
  const { data: rows } = await supabase.from('deals')
    .select('id,name,stage,value_sgd,probability,close_date,priority,company_id,companies(name),activities(activity_date)')
    .order('created_at', { ascending: false })
  const { data: companies } = await supabase.from('companies').select('id,name')
  const { data: contacts } = await supabase.from('contacts').select('id,full_name')
  const { data: appSettings } = await supabase.from('app_settings').select('stale_threshold_days').eq('id', 'singleton').single()
  const staleDays = appSettings?.stale_threshold_days ?? 14

  const now = new Date()
  const deals: DealCardData[] = (rows ?? []).map((d) => {
    const company = Array.isArray(d.companies) ? d.companies[0]?.name ?? null : (d.companies as { name: string } | null)?.name ?? null
    const dates = (d.activities ?? []).map((a) => a.activity_date).filter((x): x is string => Boolean(x))
    const lastActivityAt = dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : null
    const count30 = dates.filter((x) => (now.getTime() - new Date(x).getTime()) / 86400000 <= 30).length
    const health = healthScore({ lastActivityAt, activityCount30d: count30, closeDate: d.close_date, stage: d.stage as Stage, probability: d.probability ?? 0 }, now)
    return {
      id: d.id, name: d.name, company,
      value_sgd: d.value_sgd ?? 0, close_date: d.close_date,
      priority: d.priority ?? 'Medium', stage: d.stage, health, stale: isStale(lastActivityAt, now, staleDays),
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Deals</h1>
        <DealForm companies={companies ?? []} contacts={contacts ?? []} openOnMount={isNew === '1'} />
      </div>
      {deals.length === 0 ? (
        <EmptyState title="No deals yet" hint="Create your first deal to start tracking your pipeline." />
      ) : (
        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
          <TabsContent value="board"><KanbanBoard initialDeals={deals} /></TabsContent>
          <TabsContent value="list"><DealList deals={deals} /></TabsContent>
        </Tabs>
      )}
    </div>
  )
}
