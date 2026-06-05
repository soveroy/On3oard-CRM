import { createClient } from '@/lib/supabase/server'
import { ContactTable } from '@/components/contacts/contact-table'
import { ContactForm } from '@/components/contacts/contact-form'
import { EmptyState } from '@/components/brand/empty-state'

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; new?: string }> }) {
  const { q, new: isNew } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('contacts')
    .select('id,full_name,job_title,contact_type,do_not_contact,last_contacted_at,companies(name)')
    .order('created_at', { ascending: false })
  if (q) query = query.ilike('full_name', `%${q}%`)
  const { data: contacts, error } = await query

  const { data: companies } = await supabase.from('companies').select('id,name').order('name')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Contacts</h1>
        <ContactForm companies={companies ?? []} openOnMount={isNew === '1'} />
      </div>
      {error || !contacts?.length ? (
        <EmptyState title="No contacts yet" hint="Add your first contact." />
      ) : (
        <ContactTable contacts={contacts as Parameters<typeof ContactTable>[0]['contacts']} />
      )}
    </div>
  )
}
