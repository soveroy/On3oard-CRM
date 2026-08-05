import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import type { Database, Json } from '@/lib/supabase/types'
import { normalizeEmail } from '@/lib/integrations/suppression'

export const runtime = 'nodejs'

type ResendEvent = {
  type: string
  created_at?: string
  data?: {
    email_id?: string
    from?: string
    to?: string[]
    subject?: string
  }
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service configuration is incomplete.')
  return createClient<Database>(url, key, { auth: { persistSession: false } })
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return Response.json({ error: 'Webhook signing secret is not configured.' }, { status: 503 })
  const webhookId = request.headers.get('svix-id')
  const timestamp = request.headers.get('svix-timestamp')
  const signature = request.headers.get('svix-signature')
  if (!webhookId || !timestamp || !signature) {
    return Response.json({ error: 'Missing webhook signature headers.' }, { status: 400 })
  }

  let event: ResendEvent
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    event = resend.webhooks.verify({
      payload: await request.text(),
      headers: { id: webhookId, timestamp, signature },
      webhookSecret: secret,
    }) as ResendEvent
  } catch {
    return Response.json({ error: 'Invalid webhook signature.' }, { status: 400 })
  }

  const supabase = serviceClient()
  const providerMessageId = event.data?.email_id ?? null
  const recipient = event.type === 'email.received'
    ? normalizeEmail(event.data?.from ?? '')
    : normalizeEmail(event.data?.to?.[0] ?? '')
  const { data: campaignEmail } = providerMessageId
    ? await supabase.from('campaign_emails').select('id,contact_id').eq('provider_message_id', providerMessageId).maybeSingle()
    : { data: null }
  const { error: eventError } = await supabase.from('email_events').insert({
    webhook_id: webhookId,
    event_type: event.type,
    provider_message_id: providerMessageId,
    recipient: recipient || null,
    campaign_email_id: campaignEmail?.id ?? null,
    payload: event as unknown as Json,
    occurred_at: event.created_at ?? null,
  })
  if (eventError?.code === '23505') return Response.json({ ok: true, duplicate: true })
  if (eventError) return Response.json({ error: eventError.message }, { status: 500 })

  const timestampValue = event.created_at ?? new Date().toISOString()
  const statusUpdate = event.type === 'email.delivered'
    ? { delivery_status: 'delivered', delivered_at: timestampValue }
    : event.type === 'email.bounced'
      ? { delivery_status: 'bounced', bounced_at: timestampValue }
      : event.type === 'email.complained'
        ? { delivery_status: 'complained', complained_at: timestampValue }
        : event.type === 'email.failed'
          ? { delivery_status: 'failed' }
          : null
  if (campaignEmail?.id && statusUpdate) {
    await supabase.from('campaign_emails').update(statusUpdate).eq('id', campaignEmail.id)
  }

  if (recipient && ['email.bounced', 'email.complained', 'email.suppressed'].includes(event.type)) {
    await supabase.from('suppression_entries').upsert({
      suppression_type: 'email',
      value: recipient,
      reason: event.type,
      source: 'resend_webhook',
      contact_id: campaignEmail?.contact_id ?? null,
      active: true,
      metadata: { webhook_id: webhookId, provider_message_id: providerMessageId },
    }, { onConflict: 'suppression_type,value' })
    if (campaignEmail?.contact_id) {
      await supabase.from('contacts').update({ do_not_contact: true }).eq('id', campaignEmail.contact_id)
    }
  }

  if (event.type === 'email.received' && recipient) {
    const { data: contacts } = await supabase.from('contacts').select('id').contains('emails', [recipient]).limit(1)
    const contactId = contacts?.[0]?.id
    if (contactId) {
      await supabase.from('activities').insert({
        type: 'Email',
        subject: `Inbound reply: ${event.data?.subject || '(no subject)'}`,
        contact_id: contactId,
        activity_date: timestampValue,
        outcome: 'Neutral',
        next_action: 'Review reply and determine follow-up',
        notes: `Inbound email metadata received from ${recipient}. Open Resend to retrieve the message body.`,
      })
    }
  }

  return Response.json({ ok: true })
}
