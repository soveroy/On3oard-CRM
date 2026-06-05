'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema, stringListSchema, staleThresholdSchema } from '@/lib/validation/settings'

async function upsertSettings(patch: Record<string, unknown>) {
  const supabase = await createClient()
  const { error } = await supabase.from('app_settings').upsert({ id: 'singleton', ...patch, updated_at: new Date().toISOString() } as never)
  return error
}

export async function updateProfile(input: unknown) {
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Not signed in' }
  const { error } = await supabase.from('users').update({ full_name: parsed.data.full_name, avatar_url: parsed.data.avatar_url || null, role: parsed.data.role || null } as never).eq('id', user.id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/settings')
  return { ok: true as const }
}

export async function updateStages(stages: string[]) {
  const parsed = stringListSchema.safeParse(stages)
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid' }
  const error = await upsertSettings({ stages: parsed.data })
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/settings'); revalidatePath('/deals')
  return { ok: true as const }
}

export async function updateEngagementTypes(types: string[]) {
  const parsed = stringListSchema.safeParse(types)
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid' }
  const error = await upsertSettings({ engagement_types: parsed.data })
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/settings')
  return { ok: true as const }
}

export async function updateStaleThreshold(days: unknown) {
  const parsed = staleThresholdSchema.safeParse(days)
  if (!parsed.success) return { ok: false as const, error: 'Enter 1–365 days' }
  const error = await upsertSettings({ stale_threshold_days: parsed.data })
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/settings'); revalidatePath('/deals')
  return { ok: true as const }
}

export async function createTag(name: string, entityType?: string) {
  if (!name.trim()) return { ok: false as const, error: 'Tag name required' }
  const supabase = await createClient()
  const { error } = await supabase.from('tags').insert({ name: name.trim(), entity_type: entityType ?? null } as never)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/settings')
  return { ok: true as const }
}

export async function deleteTag(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tags').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/settings')
  return { ok: true as const }
}

// Registry-level merge: removes the source tag, keeping the target. (Rewriting entity tag
// arrays is deferred to v2 — tags on records are freeform text.)
export async function mergeTags(sourceId: string, targetId: string) {
  if (sourceId === targetId) return { ok: false as const, error: 'Pick two different tags' }
  const supabase = await createClient()
  const { error } = await supabase.from('tags').delete().eq('id', sourceId)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/settings')
  return { ok: true as const }
}
