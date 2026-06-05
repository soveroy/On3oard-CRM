'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dealSchema } from '@/lib/validation/deal'
import { canAdvanceStage } from '@/lib/domain/stage-rules'
import { defaultProbability } from '@/lib/domain/probability'
import type { Stage } from '@/lib/domain/stages'

export async function createDeal(input: unknown) {
  const parsed = dealSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, fieldErrors: parsed.error.flatten().fieldErrors }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const stage = parsed.data.stage as Stage
  const probability = parsed.data.probability ?? defaultProbability(stage)
  const { data, error } = await supabase.from('deals')
    .insert({ ...parsed.data, probability, owner_id: user?.id ?? null } as never)
    .select('id').single()
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/deals')
  return { ok: true as const, data }
}

export async function updateDeal(id: string, input: unknown) {
  const parsed = dealSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false as const, fieldErrors: parsed.error.flatten().fieldErrors }
  const supabase = await createClient()
  const { error } = await supabase.from('deals').update(parsed.data as never).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/deals'); revalidatePath(`/deals/${id}`)
  return { ok: true as const }
}

export async function moveDealStage(id: string, toStage: Stage, opts?: { lostReason?: string }) {
  const supabase = await createClient()
  const { data: deal } = await supabase.from('deals').select('value_sgd').eq('id', id).single()
  const guard = canAdvanceStage({ to: toStage, value_sgd: deal?.value_sgd ?? 0, lost_reason: opts?.lostReason })
  if (!guard.ok) return { ok: false as const, error: guard.reason }
  const { error } = await supabase.from('deals')
    .update({ stage: toStage, probability: defaultProbability(toStage), lost_reason: opts?.lostReason ?? null } as never)
    .eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/deals')
  return { ok: true as const }
}

export async function deleteDeal(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('deals').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/deals')
  return { ok: true as const }
}
