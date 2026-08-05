import { createClient } from '@/lib/supabase/server'
import { ContactForm } from '@/components/contacts/contact-form'
import { ContactsPageClient } from './contacts-page-client'
import { EmptyState } from '@/components/brand/empty-state'

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; new?: string }> }) {
  const { q, new: isNew } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('contacts')
    .select('id,full_name,job_title,contact_type,do_not_contact,last_contacted_at,company_id,emails,phones,companies(name)')
    .order('created_at', { ascending: false })
  if (q) query = query.ilike('full_name', `%${q}%`)
  const { data: contacts, error } = await query

  const { data: companies } = await supabase.from('companies').select('id,name').order('name')

  const companiesMap = (companies ?? []).reduce(
    (acc, c) => {
      acc[c.id] = c.name
      return acc
    },
    {} as Record<string, string>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ContactForm companies={companies ?? []} openOnMount={isNew === '1'} />
      </div>
      {error || !contacts?.length ? (
        <EmptyState title="No contacts yet" hint="Add your first contact." />
      ) : (
        <ContactsPageClient
          contacts={contacts}
          companiesMap={companiesMap}
        />
      )}
    </div>
  )
}
