'use client'
import { useRouter } from 'next/navigation'
import { CompanyList } from '@/components/companies/company-list'

interface Company {
  id: string
  name: string
  industry?: string | null
  size?: string | null
  contacts?: { id: string }[]
  deals?: { value_sgd: number | null }[]
}

export function CompaniesPageClient({
  companies,
}: {
  companies: Company[]
}) {
  const router = useRouter()

  const handleAddCompany = () => {
    router.push('/companies?new=1')
  }

  const handleEditCompany = (id: string) => {
    router.push(`/companies/${id}`)
  }

  const handleDeleteCompany = (id: string) => {
    console.log('Delete company:', id)
  }

  return (
    <CompanyList
      companies={companies}
      onAddClick={handleAddCompany}
      onEditClick={handleEditCompany}
      onDeleteClick={handleDeleteCompany}
    />
  )
}
