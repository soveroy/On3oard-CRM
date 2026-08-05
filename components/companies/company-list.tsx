'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { CompanyCard } from './company-card'
import { FAB } from '@/components/ui/fab'
import { Plus, Search } from 'lucide-react'

interface Company {
  id: string
  name: string
  industry?: string | null
  size?: string | null
  contacts?: { id: string }[]
  deals?: { value_sgd: number | null }[]
}

interface CompanyListProps {
  companies: Company[]
  onAddClick: () => void
  onEditClick: (id: string) => void
  onDeleteClick: (id: string) => void
}

export function CompanyList({
  companies,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: CompanyListProps) {
  const [search, setSearch] = useState('')

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header with Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-white">Companies</h1>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 text-white/40" size={18} />
          <Input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-white/60">No companies found</p>
          </div>
        ) : (
          filtered.map(company => {
            const contactCount = company.contacts?.length ?? 0
            const dealCount = company.deals?.length ?? 0
            const totalValue = company.deals?.reduce((sum, d) => sum + (d.value_sgd ?? 0), 0) ?? 0

            return (
              <CompanyCard
                key={company.id}
                id={company.id}
                name={company.name}
                industry={company.industry}
                size={company.size}
                contactCount={contactCount}
                dealCount={dealCount}
                totalValue={totalValue}
                onEdit={() => onEditClick(company.id)}
                onDelete={() => onDeleteClick(company.id)}
              />
            )
          })
        )}
      </div>

      {/* FAB - Mobile only */}
      <div className="md:hidden">
        <FAB icon={Plus} label="Add Company" onClick={onAddClick} />
      </div>

      {/* Desktop Add Button */}
      <div className="hidden md:flex justify-end pt-4">
        <button
          onClick={onAddClick}
          className="px-6 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Company
        </button>
      </div>
    </div>
  )
}
