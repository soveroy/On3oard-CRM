import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'campaigns@on3oard.com'

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { campaignEmailIds } = await req.json() as { campaignEmailIds?: string[] }
  if (!campaignEmailIds?.length) return Response.json({ error: 'No emails to send' }, { status: 400 })

  // Load the approved emails
  const { data: emails } = await supabase.from('campaign_emails')
    .select('id,to_name,to_email,subject,body')
    .in('id', campaignEmailIds)
    .eq('status', 'approved')

  if (!emails?.length) return Response.json({ error: 'No approved emails found' }, { status: 400 })

  // Send via Resend in parallel (batch of 10 to be safe)
  let sent = 0, failed = 0
  const BATCH = 10
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH)
    await Promise.allSettled(batch.map(async (email) => {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email.to_email,
          subject: email.subject,
          html: email.body,
        })
        await supabase.from('campaign_emails')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', email.id)
        sent++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        await supabase.from('campaign_emails')
          .update({ status: 'failed', error: msg })
          .eq('id', email.id)
        failed++
      }
    }))
  }

  return Response.json({ sent, failed })
}
