import { createClient } from '@/lib/supabase/server'
import { normalizeEmail } from '@/lib/integrations/suppression'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase
    .from('suppression_entries')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ suppressions: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as {
    suppression_type?: 'email' | 'domain'
    value?: string
    reason?: string
    contact_id?: string
  }
  if (!body.suppression_type || !body.value?.trim() || !body.reason?.trim()) {
    return Response.json({ error: 'suppression_type, value, and reason are required.' }, { status: 400 })
  }
  const value = normalizeEmail(body.value)
  if (body.suppression_type === 'email' && !value.includes('@')) {
    return Response.json({ error: 'Invalid email suppression value.' }, { status: 400 })
  }
  if (body.suppression_type === 'domain' && (value.includes('@') || !value.includes('.'))) {
    return Response.json({ error: 'Invalid domain suppression value.' }, { status: 400 })
  }
  const { data, error } = await supabase.from('suppression_entries').upsert({
    suppression_type: body.suppression_type,
    value,
    reason: body.reason.trim(),
    source: 'manual',
    contact_id: body.contact_id || null,
    active: true,
    created_by: user.id,
  }, { onConflict: 'suppression_type,value' }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (body.contact_id) {
    await supabase.from('contacts').update({ do_not_contact: true }).eq('id', body.contact_id)
  }
  return Response.json({ suppression: data }, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { id?: string }
  if (!body.id) {
    return Response.json({ error: 'Suppression id is required.' }, { status: 400 })
  }
  const { data: existing, error: readError } = await supabase
    .from('suppression_entries')
    .select('id,contact_id')
    .eq('id', body.id)
    .eq('active', true)
    .maybeSingle()
  if (readError) return Response.json({ error: readError.message }, { status: 500 })
  if (!existing) return Response.json({ error: 'Active suppression not found.' }, { status: 404 })

  const { error } = await supabase
    .from('suppression_entries')
    .update({
      active: false,
      metadata: { deactivated_by: user.id, deactivated_at: new Date().toISOString() },
    })
    .eq('id', body.id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (existing.contact_id) {
    await supabase.from('contacts').update({ do_not_contact: false }).eq('id', existing.contact_id)
  }
  return Response.json({ ok: true })
}
