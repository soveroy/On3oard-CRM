import { createClient } from '@/lib/supabase/server'
import { ActivitiesPageClient } from './activities-page-client'

export default async function ActivitiesPage() {
  const supabase = await createClient()

  // Fetch all activities with related deal and contact data
  const { data: allActivities } = await supabase.from('activities')
    .select(`
      id,
      type,
      subject,
      notes,
      next_action_due,
      deal_id,
      contact_id,
      deal:deals(id,name),
      contact:contacts(id,full_name)
    `)
    .order('next_action_due', { ascending: true })

  // Separate into upcoming (with next_action_due) and completed (without next_action_due)
  const upcomingActivities = (allActivities ?? []).filter(a => a.next_action_due)
  const completedActivities = (allActivities ?? []).filter(a => !a.next_action_due)

  // Fetch deals and contacts for the form
  const { data: deals } = await supabase.from('deals').select('id,name')
  const { data: contacts } = await supabase.from('contacts').select('id,full_name')

  // Fetch recent activities for activity summary
  const since = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data: recent } = await supabase.from('activities').select('type,activity_date').gte('activity_date', since)

  return (
    <ActivitiesPageClient
      pending={upcomingActivities}
      completed={completedActivities}
      deals={deals ?? []}
      contacts={contacts ?? []}
      recent={recent ?? []}
    />
  )
}
