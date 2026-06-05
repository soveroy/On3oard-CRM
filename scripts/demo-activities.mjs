// On3oard CRM — demo ACTIVITIES seeder.
// Attaches realistic activities (calls, emails, meetings, follow-ups) to the existing
// demo deals/contacts so the Activities page (Overdue/Today/Upcoming + weekly summary)
// and the deal/contact timelines look populated for a customer demo.
//
// Cleanup is automatic: these activities link to demo deals/contacts, and the FK
// cascades delete them when you remove the demo records:
//   delete from deals where 'demo' = any(tags);   -- cascades to activities
//   delete from contacts where 'demo' = any(tags);
//
// Run from project root:  node scripts/demo-activities.mjs
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }),
)
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const pick = (a) => a[Math.floor(Math.random() * a.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const at = (deltaDays, hour = 10) => { const d = new Date(); d.setDate(d.getDate() + deltaDays); d.setHours(hour, 0, 0, 0); return d.toISOString() }

const OUTCOMES = ['Positive', 'Neutral', 'Negative', 'No Response']
// templates: [type, subject, notes, nextAction]
const TOUCHPOINTS = [
  ['Call', 'Discovery call', 'Walked through their current workflow and pain points. Strong interest in automation.', 'Send tailored proposal'],
  ['Meeting', 'Scoping workshop', 'Mapped the 4D engagement scope with their ops lead. Budget range confirmed.', 'Share workshop summary + pricing'],
  ['Email', 'Proposal follow-up', 'Sent the proposal; they are reviewing internally with the CFO.', 'Chase for decision'],
  ['WhatsApp', 'Quick check-in', 'Pinged on WhatsApp — they want to reconvene after their board meeting.', 'Schedule follow-up call'],
  ['LinkedIn Message', 'Intro via referral', 'Connected on LinkedIn after a referral from a former colleague.', 'Book an intro call'],
  ['Call', 'Pricing discussion', 'Discussed pricing tiers; some concern on timeline, not budget.', 'Send revised timeline'],
  ['Meeting', 'Stakeholder alignment', 'Met the wider team; procurement wants a formal quote.', 'Issue formal quote'],
  ['Email', 'Grant advisory intro', 'Shared an overview of applicable grants for their sector.', 'Confirm eligibility call'],
]
const PLAIN = [
  ['Note', 'Account note', 'Flagged as a high-potential account for Q3 outreach.'],
  ['Email', 'Sent intro deck', 'Shared the On3oard capabilities deck.'],
  ['Call', 'Voicemail left', 'No answer — left a voicemail to reconnect.'],
  ['Proposal Sent', 'Proposal delivered', 'Formal proposal sent via email.'],
  ['Meeting', 'Coffee catch-up', 'Informal catch-up to maintain the relationship.'],
  ['LinkedIn Message', 'Shared an article', 'Sent a relevant case study on AI in their industry.'],
]

async function main() {
  const { data: deals, error } = await db.from('deals').select('id,primary_contact_id').contains('tags', ['demo'])
  if (error) throw error
  if (!deals?.length) { console.error('No demo deals found. Run scripts/demo-seed.mjs first.'); process.exit(1) }
  console.log(`Found ${deals.length} demo deals to attach activities to.`)

  const rows = []
  const add = (deal, type, subject, notes, opts = {}) => rows.push({
    type, subject, notes,
    deal_id: deal.id,
    contact_id: deal.primary_contact_id,
    activity_date: opts.activity_date ?? at(-randInt(1, 25)),
    duration_mins: type === 'Call' || type === 'Meeting' ? randInt(15, 60) : null,
    outcome: pick(OUTCOMES),
    next_action: opts.next_action ?? null,
    next_action_due: opts.next_action_due ?? null,
  })

  const shuffled = [...deals].sort(() => Math.random() - 0.5)
  let i = 0
  const nextDeal = () => shuffled[(i++) % shuffled.length]

  // Overdue follow-ups (5) — due in the past → show red on the Activities page
  for (let n = 0; n < 5; n++) {
    const [type, subject, notes, action] = pick(TOUCHPOINTS)
    add(nextDeal(), type, subject, notes, { activity_date: at(-randInt(8, 20)), next_action: action, next_action_due: at(-randInt(1, 6)) })
  }
  // Due today (3)
  for (let n = 0; n < 3; n++) {
    const [type, subject, notes, action] = pick(TOUCHPOINTS)
    add(nextDeal(), type, subject, notes, { activity_date: at(-randInt(2, 7)), next_action: action, next_action_due: new Date().toISOString() })
  }
  // Upcoming follow-ups (6)
  for (let n = 0; n < 6; n++) {
    const [type, subject, notes, action] = pick(TOUCHPOINTS)
    add(nextDeal(), type, subject, notes, { activity_date: at(-randInt(1, 5)), next_action: action, next_action_due: at(randInt(1, 12)) })
  }
  // Plain logged activities (16) — populate timelines + this-week summary, no follow-up
  for (let n = 0; n < 16; n++) {
    const [type, subject, notes] = pick(PLAIN)
    add(nextDeal(), type, subject, notes, { activity_date: at(-randInt(0, 6)) })
  }

  const { data: inserted, error: insErr } = await db.from('activities').insert(rows).select('id')
  if (insErr) throw insErr
  console.log(`✓ inserted ${inserted.length} activities (5 overdue, 3 today, 6 upcoming, 16 logged)`)
}

main().catch((e) => { console.error('Failed:', e.message ?? e); process.exit(1) })
