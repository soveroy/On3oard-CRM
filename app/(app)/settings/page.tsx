import { createClient } from '@/lib/supabase/server'
import { DEFAULT_STAGES } from '@/lib/domain/stages'
import { ENGAGEMENT_TYPES } from '@/lib/constants'
import { updateStages, updateEngagementTypes, createTag, deleteTag, mergeTags } from './actions'
import { ListEditor } from '@/components/settings/list-editor'
import { TagsManager } from '@/components/settings/tags-manager'
import { ProfileForm } from '@/components/settings/profile-form'
import { StaleThresholdForm } from '@/components/settings/stale-threshold-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from('users').select('full_name,email,avatar_url,role').eq('id', user.id).single() : { data: null }
  const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 'singleton').single()
  const { data: tags } = await supabase.from('tags').select('id,name').order('name')
  const { data: team } = await supabase.from('users').select('id,full_name,email,role').order('full_name')

  const stages = settings?.stages ?? [...DEFAULT_STAGES]
  const engagement = settings?.engagement_types ?? [...ENGAGEMENT_TYPES]
  const staleDays = settings?.stale_threshold_days ?? 14

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-2xl">Settings</h1>

      <Section title="Profile">
        <ProfileForm initial={{ full_name: profile?.full_name ?? '', email: profile?.email ?? user?.email ?? '', avatar_url: profile?.avatar_url ?? '', role: profile?.role ?? '' }} />
      </Section>

      <Section title="Pipeline stages" desc="Rename, reorder, add or remove deal stages.">
        <ListEditor title="Stages" initial={stages} onSave={updateStages} />
      </Section>

      <Section title="Engagement types">
        <ListEditor title="Engagement types" initial={engagement} onSave={updateEngagementTypes} />
      </Section>

      <Section title="Tags">
        <TagsManager initial={tags ?? []} onCreate={createTag} onDelete={deleteTag} onMerge={mergeTags} />
      </Section>

      <Section title="Stale deal threshold" desc="Days without activity before a deal is flagged stale.">
        <StaleThresholdForm initial={staleDays} />
      </Section>

      <Section title="Team members">
        <ul className="space-y-1 text-sm">
          {(team ?? []).map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-md border border-surface-border bg-surface-raised/30 px-3 py-2">
              <span>{m.full_name ?? m.email}</span>
              <span className="text-white/40">{m.role ?? 'member'}</span>
            </li>
          ))}
          {!team?.length && <li className="text-sm text-white/40">No team members yet.</li>}
        </ul>
      </Section>

      <Section title="Notifications" desc="Email alerts for follow-ups and stage changes.">
        <div className="flex items-center justify-between rounded-md border border-surface-border bg-surface-raised/30 px-3 py-2 text-sm text-white/40">
          <span>Email notifications</span>
          <span className="rounded bg-white/5 px-2 py-0.5 text-xs">Coming in v2</span>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg">{title}</h2>
      {desc && <p className="mb-3 mt-0.5 text-sm text-white/50">{desc}</p>}
      <div className={desc ? '' : 'mt-3'}>{children}</div>
    </section>
  )
}
