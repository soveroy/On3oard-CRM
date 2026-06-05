import { createClient } from '@/lib/supabase/server'
import { CompanyTable } from '@/components/companies/company-table'
import { CompanyForm } from '@/components/companies/company-form'
import { EmptyState } from '@/components/brand/empty-state'

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ q?: string; new?: string }> }) {
  const { q, new: isNew } = await searchParams
  const supabase = await createClient()
  let query = supabase
    .from('companies')
    .select('id,name,industry,size,contacts(id),deals(value_sgd)')
    .order('created_at', { ascending: false })
  if (q) query = query.ilike('name', `%${q}%`)
  const { data: companies, error } = await query

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Companies</h1>
        <CompanyForm openOnMount={isNew === '1'} />
      </div>
      {error || !companies?.length ? (
        <EmptyState title="No companies yet" hint="Add your first company to anchor contacts and deals." />
      ) : (
        <CompanyTable companies={companies} />
      )}
    </div>
  )
}
