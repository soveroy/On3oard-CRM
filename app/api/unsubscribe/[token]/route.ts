import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { normalizeEmail } from '@/lib/integrations/suppression'

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service configuration is incomplete.')
  return createClient<Database>(url, key, { auth: { persistSession: false } })
}

async function suppress(token: string) {
  const supabase = serviceClient()
  const { data: email, error } = await supabase
    .from('campaign_emails')
    .select('id,to_email,contact_id')
    .eq('unsubscribe_token', token)
    .maybeSingle()
  if (error || !email) return false
  const value = normalizeEmail(email.to_email)
  await supabase.from('suppression_entries').upsert({
    suppression_type: 'email',
    value,
    reason: 'Recipient unsubscribed',
    source: 'unsubscribe',
    contact_id: email.contact_id,
    active: true,
  }, { onConflict: 'suppression_type,value' })
  await supabase.from('campaign_emails')
    .update({ unsubscribed_at: new Date().toISOString(), delivery_status: 'suppressed' })
    .eq('id', email.id)
  if (email.contact_id) {
    await supabase.from('contacts').update({ do_not_contact: true }).eq('id', email.contact_id)
  }
  return true
}

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params
  const body = `<!doctype html><html><body><main><h1>Unsubscribe from On3oard outreach</h1><form method="post"><button type="submit">Confirm unsubscribe</button></form></main></body></html>`
  if (!/^[0-9a-f-]{36}$/i.test(token)) return new Response('Invalid unsubscribe link.', { status: 400 })
  return new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params
  if (!/^[0-9a-f-]{36}$/i.test(token)) return new Response('Invalid unsubscribe link.', { status: 400 })
  const ok = await suppress(token)
  return new Response(
    ok ? 'You have been unsubscribed from On3oard outreach.' : 'This unsubscribe link is invalid or expired.',
    { status: ok ? 200 : 404 },
  )
}
