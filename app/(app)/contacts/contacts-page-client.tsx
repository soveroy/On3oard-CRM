'use client'
import { useRouter } from 'next/navigation'
import { ContactList } from '@/components/contacts/contact-list'

interface Contact {
  id: string
  full_name: string
  job_title?: string | null
  contact_type?: string | null
  do_not_contact?: boolean | null
  last_contacted_at?: string | null
  emails?: string[] | null
  phones?: string[] | null
  company_id?: string | null
  companies?: { name: string } | null
}

export function ContactsPageClient({
  contacts,
  companiesMap,
}: {
  contacts: Contact[]
  companiesMap: Record<string, string>
}) {
  const router = useRouter()

  const handleAddContact = () => {
    router.push('/contacts?new=1')
  }

  const handleEditContact = (id: string) => {
    router.push(`/contacts/${id}`)
  }

  const handleDeleteContact = (id: string) => {
    console.log('Delete contact:', id)
  }

  const normalizedContacts = contacts.map(c => ({
    id: c.id,
    full_name: c.full_name,
    job_title: c.job_title,
    contact_type: c.contact_type,
    do_not_contact: c.do_not_contact,
    last_contacted_at: c.last_contacted_at,
    email: c.emails?.[0],
    phone: c.phones?.[0],
    company_id: c.company_id,
    company_name: c.companies?.name,
  }))

  return (
    <ContactList
      contacts={normalizedContacts}
      onAddClick={handleAddContact}
      onEditClick={handleEditContact}
      onDeleteClick={handleDeleteContact}
      companiesMap={companiesMap}
    />
  )
}
