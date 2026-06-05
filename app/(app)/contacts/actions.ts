'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { contactSchema } from '@/lib/validation/contact'
import { findDuplicateEmail } from '@/lib/domain/dedupe'

export async function createContact(input: unknown) {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, fieldErrors: parsed.error.flatten().fieldErrors }
  const supabase = await createClient()
  if (parsed.data.emails.length) {
    const { data: existing } = await supabase.from('contacts').select('id,emails')
    const dupId = findDuplicateEmail((existing ?? []).map((c) => ({ id: c.id, emails: c.emails ?? [] })), parsed.data.emails)
    if (dupId) return { ok: false as const, error: 'A contact with this email already exists', duplicateId: dupId }
  }
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('contacts').insert({ ...parsed.data, owner_id: user?.id ?? null } as never).select('id').single()
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/contacts')
  return { ok: true as const, data }
}

export async function updateContact(id: string, input: unknown) {
  const parsed = contactSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false as const, fieldErrors: parsed.error.flatten().fieldErrors }
  const supabase = await createClient()
  const { error } = await supabase.from('contacts').update(parsed.data as never).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/contacts'); revalidatePath(`/contacts/${id}`)
  return { ok: true as const }
}

export async function deleteContact(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/contacts')
  return { ok: true as const }
}
