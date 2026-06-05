'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { activitySchema } from '@/lib/validation/activity'

export async function createActivity(input: unknown) {
  const parsed = activitySchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, fieldErrors: parsed.error.flatten().fieldErrors }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('activities')
    .insert({ ...parsed.data, created_by: user?.id ?? null } as never)
    .select('id').single()
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/activities'); revalidatePath('/dashboard')
  if (parsed.data.deal_id) revalidatePath(`/deals/${parsed.data.deal_id}`)
  if (parsed.data.contact_id) revalidatePath(`/contacts/${parsed.data.contact_id}`)
  return { ok: true as const, data }
}
