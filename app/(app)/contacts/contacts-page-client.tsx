'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContactTable, type ContactRow } from '@/components/contacts/contact-table'
import { ContactListMobile } from '@/components/contacts/contact-list-mobile'

interface ContactMobile {
  id: string
  full_name: string
  email?: string
  phone?: string
  company_id?: string | null
}

export function ContactsPageClient({
  contactsDesktop,
  contactsMobile,
  companiesMap,
}: {
  contactsDesktop: ContactRow[]
  contactsMobile: ContactMobile[]
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
    // TODO: Implement delete functionality
    // This would typically open a confirmation dialog and call a server action
    console.log('Delete contact:', id)
  }

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden md:block">
        <ContactTable contacts={contactsDesktop} />
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden">
        <ContactListMobile
          contacts={contactsMobile}
          onAddClick={handleAddContact}
          onEditClick={handleEditContact}
          onDeleteClick={handleDeleteContact}
          companies={companiesMap}
        />
      </div>
    </>
  )
}
