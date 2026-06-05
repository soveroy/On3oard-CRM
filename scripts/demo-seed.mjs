// On3oard CRM — demo data seeder (for sales demos).
// Inserts ~15 companies, contacts, and 35 deals (10 Won, 5 funnel, 20 Lead).
// Everything is tagged 'demo' so it can be removed later:
//   delete from deals where 'demo' = any(tags);
//   delete from contacts where 'demo' = any(tags);
//   delete from companies where 'demo' = any(tags);
// Run from the project root:  node scripts/demo-seed.mjs
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// --- load .env.local (no extra deps) ---
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }),
)
const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey || serviceKey.startsWith('placeholder')) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
const db = createClient(url, serviceKey, { auth: { persistSession: false } })

// --- helpers ---
const pick = (a) => a[Math.floor(Math.random() * a.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const money = () => randInt(3, 24) * 5000 // 15k..120k
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d }
const daysAhead = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d }
const isoDate = (d) => d.toISOString().slice(0, 10)
const iso = (d) => d.toISOString()

const ENG = ['AI Strategy', 'ESG/Sustainability', 'Grant Advisory', 'Full 4D Engagement', 'Other']
const SRC = ['Referral', 'LinkedIn', 'Event', 'Cold Outreach', 'Inbound', 'Former Colleague']
const PRI = ['High', 'Medium', 'Low']
const TITLES = ['CEO', 'Operations Director', 'Head of HR', 'Procurement Manager', 'CFO', 'Facilities Manager', 'Managing Director', 'General Manager', 'Head of Strategy', 'COO']
const FIRST = ['Wei Ming', 'Siti', 'Arjun', 'Mei Ling', 'Daniel', 'Priya', 'Hafiz', 'Joanne', 'Ramesh', 'Grace', 'Kumar', 'Faridah', 'Jason', 'Aishah', 'Marcus']
const LAST = ['Tan', 'Lim', 'Kumar', 'Wong', 'Lee', 'Nair', 'Rahman', 'Ng', 'Pillai', 'Goh', 'Raj', 'Ismail', 'Chan', 'Teo', 'Koh']

const COMPANIES = [
  ['Pacific Marine Services', 'Marine', '51-200'],
  ['Sentosa Shipyard Group', 'Marine', '201-500'],
  ['Jurong Port Logistics', 'Logistics', '500+'],
  ['Tampines Medical Group', 'Healthcare', '201-500'],
  ['Raffles Learning Holdings', 'Education', '51-200'],
  ['Changi Food Concepts', 'F&B', '51-200'],
  ['Tuas Facilities Management', 'FM', '201-500'],
  ['Keppel Estate Services', 'FM', '500+'],
  ['Northpoint Polyclinic Network', 'Healthcare', '500+'],
  ['Lion City Academy', 'Education', '11-50'],
  ['Eastern Freight Solutions', 'Logistics', '201-500'],
  ['Marina Hospitality Group', 'F&B', '51-200'],
  ['Woodlands Precision Mfg', 'Other', '51-200'],
  ['Bedok Eldercare Services', 'Healthcare', '11-50'],
  ['Pasir Ris Cleaning Co', 'FM', '11-50'],
]

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

async function main() {
  // 1) companies
  const companyRows = COMPANIES.map(([name, industry, size]) => ({
    name: `${name} Pte Ltd`, industry, size, country: 'Singapore', tags: ['demo'],
  }))
  const { data: companies, error: cErr } = await db.from('companies').insert(companyRows).select('id,name')
  if (cErr) throw cErr
  console.log(`✓ inserted ${companies.length} companies`)

  // 2) one contact per company
  const contactRows = companies.map((c, i) => ({
    full_name: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
    job_title: TITLES[i % TITLES.length],
    company_id: c.id,
    emails: [`${slug(FIRST[i % FIRST.length])}@${slug(c.name)}.com.sg`],
    contact_type: 'Prospect',
    lead_source: pick(SRC),
    tags: ['demo'],
  }))
  const { data: contacts, error: ctErr } = await db.from('contacts').insert(contactRows).select('id,company_id')
  if (ctErr) throw ctErr
  console.log(`✓ inserted ${contacts.length} contacts`)

  const contactByCompany = Object.fromEntries(contacts.map((c) => [c.company_id, c.id]))
  const companyName = Object.fromEntries(companies.map((c) => [c.id, c.name]))
  const randomCompany = () => pick(companies)

  const deals = []
  const makeDeal = (stage, probability, opts) => {
    const c = randomCompany()
    const eng = pick(ENG)
    return {
      name: `${companyName[c.id].replace(' Pte Ltd', '')} — ${eng}`,
      company_id: c.id,
      primary_contact_id: contactByCompany[c.id] ?? null,
      engagement_type: eng,
      value_sgd: money(),
      probability,
      stage,
      source: pick(SRC),
      priority: pick(PRI),
      tags: ['demo'],
      ...opts,
    }
  }

  // 3) 10 Won — stage_changed_at spread over last ~6 months for the revenue chart
  for (let i = 0; i < 10; i++) {
    const closed = daysAgo(randInt(5, 175))
    deals.push(makeDeal('Won', 100, {
      close_date: isoDate(closed),
      stage_changed_at: iso(closed),
      created_at: iso(daysAgo(randInt(180, 260))),
    }))
  }
  // 4) 5 funnel — mid stages, future close dates
  const funnel = [['Qualified', 25], ['Discovery', 40], ['Proposal Sent', 60], ['Negotiation', 80], ['Discovery', 40]]
  for (const [stage, prob] of funnel) {
    deals.push(makeDeal(stage, prob, {
      close_date: isoDate(daysAhead(randInt(15, 75))),
      stage_changed_at: iso(daysAgo(randInt(1, 20))),
    }))
  }
  // 5) 20 leads
  for (let i = 0; i < 20; i++) {
    deals.push(makeDeal('Lead', 10, {
      close_date: isoDate(daysAhead(randInt(30, 120))),
      stage_changed_at: iso(daysAgo(randInt(1, 30))),
    }))
  }

  const { data: insertedDeals, error: dErr } = await db.from('deals').insert(deals).select('id,stage')
  if (dErr) throw dErr
  const byStage = insertedDeals.reduce((m, d) => { m[d.stage] = (m[d.stage] ?? 0) + 1; return m }, {})
  console.log(`✓ inserted ${insertedDeals.length} deals:`, byStage)
  console.log('\nDone. All demo records are tagged "demo". To remove later, run in SQL editor:')
  console.log("  delete from deals where 'demo' = any(tags);")
  console.log("  delete from contacts where 'demo' = any(tags);")
  console.log("  delete from companies where 'demo' = any(tags);")
}

main().catch((e) => { console.error('Seed failed:', e.message ?? e); process.exit(1) })
