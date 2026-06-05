'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { companySchema } from '@/lib/validation/company'

export async function createCompany(input: unknown) {
  const parsed = companySchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, fieldErrors: parsed.error.flatten().fieldErrors }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('companies').insert({ ...parsed.data, owner_id: user?.id ?? null }).select('id').single()
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/companies')
  return { ok: true as const, data }
}

export async function updateCompany(id: string, input: unknown) {
  const parsed = companySchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false as const, fieldErrors: parsed.error.flatten().fieldErrors }
  const supabase = await createClient()
  const { error } = await supabase.from('companies').update(parsed.data).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/companies'); revalidatePath(`/companies/${id}`)
  return { ok: true as const }
}

export async function deleteCompany(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('companies').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/companies')
  return { ok: true as const }
}
