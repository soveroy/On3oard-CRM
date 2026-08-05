'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { ContactCard } from './contact-card'
import { FAB } from '@/components/ui/fab'
import { Plus, Search } from 'lucide-react'

interface Contact {
  id: string
  full_name: string
  job_title?: string | null
  contact_type?: string | null
  do_not_contact?: boolean | null
  last_contacted_at?: string | null
  email?: string
  phone?: string
  company_id?: string | null
  company_name?: string
}

interface ContactListProps {
  contacts: Contact[]
  onAddClick: () => void
  onEditClick: (id: string) => void
  onDeleteClick: (id: string) => void
  companiesMap?: Record<string, string>
}

export function ContactList({
  contacts,
  onAddClick,
  onEditClick,
  onDeleteClick,
  companiesMap = {},
}: ContactListProps) {
  const [search, setSearch] = useState('')

  const filtered = contacts.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search.toLowerCase()) ||
    c.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header with Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-white">Contacts</h1>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 text-white/40" size={18} />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-white/60">No contacts found</p>
          </div>
        ) : (
          filtered.map(contact => (
            <ContactCard
              key={contact.id}
              id={contact.id}
              name={contact.full_name}
              company={contact.company_name || (contact.company_id ? companiesMap[contact.company_id] : undefined)}
              phone={contact.phone}
              email={contact.email}
              type={contact.contact_type || undefined}
              lastContacted={contact.last_contacted_at}
              doNotContact={contact.do_not_contact || false}
              onEdit={() => onEditClick(contact.id)}
              onDelete={() => onDeleteClick(contact.id)}
            />
          ))
        )}
      </div>

      {/* FAB - Mobile only */}
      <div className="md:hidden">
        <FAB icon={Plus} label="Add Contact" onClick={onAddClick} />
      </div>

      {/* Desktop Add Button */}
      <div className="hidden md:flex justify-end pt-4">
        <button
          onClick={onAddClick}
          className="px-6 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Contact
        </button>
      </div>
    </div>
  )
}
