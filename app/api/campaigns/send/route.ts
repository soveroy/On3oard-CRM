import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { suppressionReason } from '@/lib/integrations/suppression'

export const runtime = 'nodejs'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'campaigns@on3oard.com'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  if (process.env.OUTREACH_LIVE_SEND_ENABLED !== 'true') {
    return Response.json({
      error: 'Live sending is locked. Keep using the Prospect Platform test campaign workflow.',
    }, { status: 403 })
  }
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: 'RESEND_API_KEY is not configured.' }, { status: 503 })
  }

  const { campaignEmailIds, confirmation } = await req.json() as {
    campaignEmailIds?: string[]
    confirmation?: string
  }
  if (!campaignEmailIds?.length) return Response.json({ error: 'No emails to send' }, { status: 400 })
  if (campaignEmailIds.length > 5) {
    return Response.json({ error: 'Live executions are capped at five emails.' }, { status: 400 })
  }
  const expectedConfirmation = `SEND ${campaignEmailIds.length} LIVE`
  if (confirmation !== expectedConfirmation) {
    return Response.json({ error: `Type exactly ${expectedConfirmation} to authorize this execution.` }, { status: 400 })
  }

  const { data: emails } = await supabase.from('campaign_emails')
    .select('id,contact_id,to_name,to_email,subject,body,unsubscribe_token')
    .in('id', campaignEmailIds)
    .eq('status', 'approved')

  if (!emails?.length) return Response.json({ error: 'No approved emails found' }, { status: 400 })
  if (emails.length !== campaignEmailIds.length) {
    return Response.json({ error: 'One or more selected emails are no longer approved.' }, { status: 409 })
  }
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id,do_not_contact')
    .in('id', emails.map((email) => email.contact_id).filter((id): id is string => Boolean(id)))
  const blockedContacts = new Set((contacts ?? []).filter((contact) => contact.do_not_contact).map((contact) => contact.id))
  const { data: suppressions } = await supabase
    .from('suppression_entries')
    .select('suppression_type,value,active')
    .eq('active', true)
  for (const email of emails) {
    const reason = suppressionReason(email.to_email, suppressions ?? [])
    if ((email.contact_id && blockedContacts.has(email.contact_id)) || reason) {
      await supabase.from('campaign_emails')
        .update({ delivery_status: 'suppressed', error: reason || 'Contact is marked do not contact.' })
        .eq('id', email.id)
      return Response.json({ error: `${email.to_email} is suppressed or marked do not contact.` }, { status: 409 })
    }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (!siteUrl.startsWith('https://')) {
    return Response.json({ error: 'NEXT_PUBLIC_SITE_URL must be a public HTTPS URL before live sending.' }, { status: 503 })
  }
  let sent = 0, failed = 0
  const BATCH = 5
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH)
    await Promise.allSettled(batch.map(async (email) => {
      try {
        const unsubscribeUrl = `${siteUrl}/api/unsubscribe/${email.unsubscribe_token}`
        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: email.to_email,
          subject: email.subject,
          html: email.body,
          replyTo: process.env.RESEND_REPLY_TO_EMAIL || undefined,
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        })
        if (result.error || !result.data?.id) throw new Error(result.error?.message || 'Resend did not return a message ID.')
        await supabase.from('campaign_emails')
          .update({
            status: 'sent',
            delivery_status: 'sent',
            provider_message_id: result.data.id,
            sent_at: new Date().toISOString(),
            error: null,
          })
          .eq('id', email.id)
        sent++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        await supabase.from('campaign_emails')
          .update({ status: 'failed', delivery_status: 'failed', error: msg })
          .eq('id', email.id)
        failed++
      }
    }))
  }

  return Response.json({ sent, failed })
}
