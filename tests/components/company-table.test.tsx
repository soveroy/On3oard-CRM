import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }))
import { CompanyTable } from '@/components/companies/company-table'
describe('CompanyTable', () => {
  it('renders a company name and formatted total deal value', () => {
    render(<CompanyTable companies={[{ id: '1', name: 'PNH Group', industry: 'Marine', size: '500+', contacts: [{ id: 'a' }], deals: [{ value_sgd: 100800 }] }]} />)
    expect(screen.getByText('PNH Group')).toBeInTheDocument()
    expect(screen.getByText('$100,800')).toBeInTheDocument()
  })
})
