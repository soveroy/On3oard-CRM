// Replaces existing demo Won deals with ones that produce an increasing revenue trend.
// Month 5-ago → Month now: $15k → $25k → $35k → $50k → $70k → $90k (roughly doubling)
// Run from project root: node scripts/fix-revenue-trend.mjs
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

// Engagement types mapped to realistic On3oard deal names for Won deals
const WON_DEALS = [
  { eng: 'AI Strategy',          label: 'AI Strategy Advisory' },
  { eng: 'Grant Advisory',       label: 'Enterprise Grant Programme' },
  { eng: 'ESG/Sustainability',   label: 'ESG Roadmap Engagement' },
  { eng: 'Full 4D Engagement',   label: 'Full 4D Transformation' },
  { eng: 'AI Strategy',          label: 'AI Pilot Workshop' },
  { eng: 'Grant Advisory',       label: 'Innovation Grant Advisory' },
  { eng: 'Full 4D Engagement',   label: '4D Process Redesign' },
  { eng: 'AI Strategy',          label: 'Data & AI Strategy Sprint' },
  { eng: 'ESG/Sustainability',   label: 'Sustainability Baseline Study' },
  { eng: 'Full 4D Engagement',   label: 'Full 4D Enterprise Rollout' },
]

// Increasing monthly revenue: 6 months ago → now
// Two deals land in some months for a realistic "growth" shape
const MONTHLY_PLAN = [
  { monthsAgo: 5, values: [15000] },
  { monthsAgo: 4, values: [18000, 12000] },
  { monthsAgo: 3, values: [28000] },
  { monthsAgo: 2, values: [35000, 20000] },
  { monthsAgo: 1, values: [45000, 30000] },
  { monthsAgo: 0, values: [55000, 42000] },   // this month — highest
]

function wonAt(monthsAgo, dayOffset = 0) {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo)
  d.setDate(randInt(3, 24) + dayOffset)
  d.setHours(randInt(9, 17), 0, 0, 0)
  return d
}

async function main() {
  // 1) Delete existing demo Won deals
  const { error: delErr, count } = await db.from('deals')
    .delete({ count: 'exact' })
    .eq('stage', 'Won')
    .contains('tags', ['demo'])
  if (delErr) throw delErr
  console.log(`✓ deleted ${count ?? '?'} existing demo Won deals`)

  // 2) Fetch demo companies to attach new deals to
  const { data: companies } = await db.from('companies').select('id,name').contains('tags', ['demo'])
  if (!companies?.length) { console.error('No demo companies found — run demo-seed.mjs first'); process.exit(1) }
  const { data: contacts } = await db.from('contacts').select('id,company_id').contains('tags', ['demo'])
  const contactByCompany = Object.fromEntries((contacts ?? []).map((c) => [c.company_id, c.id]))

  // 3) Build new Won deals following the increasing monthly plan
  const rows = []
  let dealIdx = 0
  for (const { monthsAgo, values } of MONTHLY_PLAN) {
    for (const value_sgd of values) {
      const template = WON_DEALS[dealIdx % WON_DEALS.length]
      const company = companies[dealIdx % companies.length]
      const closedAt = wonAt(monthsAgo)
      rows.push({
        name: `${company.name.replace(' Pte Ltd', '')} — ${template.label}`,
        company_id: company.id,
        primary_contact_id: contactByCompany[company.id] ?? null,
        engagement_type: template.eng,
        value_sgd,
        probability: 100,
        stage: 'Won',
        source: pick(['Referral', 'LinkedIn', 'Event', 'Inbound', 'Former Colleague']),
        priority: value_sgd >= 40000 ? 'High' : 'Medium',
        tags: ['demo'],
        close_date: closedAt.toISOString().slice(0, 10),
        stage_changed_at: closedAt.toISOString(),
        created_at: new Date(closedAt.getTime() - randInt(30, 90) * 86400000).toISOString(),
      })
      dealIdx++
    }
  }

  const { data: inserted, error: insErr } = await db.from('deals').insert(rows).select('id,value_sgd,stage_changed_at')
  if (insErr) throw insErr

  console.log(`✓ inserted ${inserted.length} Won deals with increasing revenue trend:`)
  const byMonth = {}
  for (const d of inserted) {
    const key = new Date(d.stage_changed_at).toLocaleString('en-SG', { month: 'short', year: '2-digit' })
    byMonth[key] = (byMonth[key] ?? 0) + d.value_sgd
  }
  for (const [month, total] of Object.entries(byMonth)) {
    console.log(`  ${month}: $${total.toLocaleString()}`)
  }
  console.log('\nRefresh the dashboard — Revenue chart should now trend upward.')
}

main().catch((e) => { console.error('Failed:', e.message ?? e); process.exit(1) })
