import { createClient } from '@/lib/supabase/server'
import { ContactTable } from '@/components/contacts/contact-table'
import { ContactForm } from '@/components/contacts/contact-form'
import { ContactListMobile } from '@/components/contacts/contact-list-mobile'
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

  // Transform contacts data to include first email/phone for mobile view
  const contactsWithFirstContact = contacts?.map(c => ({
    ...c,
    email: c.emails?.[0],
    phone: c.phones?.[0],
  })) ?? []

  // Create a map of company_id to company name for mobile view
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
        <h1 className="font-display text-2xl">Contacts</h1>
        <ContactForm companies={companies ?? []} openOnMount={isNew === '1'} />
      </div>
      {error || !contacts?.length ? (
        <EmptyState title="No contacts yet" hint="Add your first contact." />
      ) : (
        <ContactsPageClient
          contactsDesktop={contacts as Parameters<typeof ContactTable>[0]['contacts']}
          contactsMobile={contactsWithFirstContact}
          companiesMap={companiesMap}
        />
      )}
    </div>
  )
}
