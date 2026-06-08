'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { ContactCard } from './contact-card'
import { FAB } from '@/components/ui/fab'
import { Plus, Search } from 'lucide-react'

interface Contact {
  id: string
  full_name: string
  email?: string
  phone?: string
  company_id?: string
}

interface ContactListMobileProps {
  contacts: Contact[]
  onAddClick: () => void
  onEditClick: (id: string) => void
  onDeleteClick: (id: string) => void
  companies?: Record<string, string> // Map of company_id to company name
}

export function ContactListMobile({
  contacts,
  onAddClick,
  onEditClick,
  onDeleteClick,
  companies = {},
}: ContactListMobileProps) {
  const [search, setSearch] = useState('')

  const filtered = contacts.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 p-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-white/40" size={18} />
        <Input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contact List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-white/60 py-8">No contacts found</p>
        ) : (
          filtered.map(contact => (
            <ContactCard
              key={contact.id}
              id={contact.id}
              name={contact.full_name}
              company={contact.company_id ? companies[contact.company_id] : undefined}
              phone={contact.phone}
              email={contact.email}
              onEdit={() => onEditClick(contact.id)}
              onDelete={() => onDeleteClick(contact.id)}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <FAB icon={Plus} label="Add Contact" onClick={onAddClick} />
    </div>
  )
}
