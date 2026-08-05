import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }))
import { ContactTable } from '@/components/contacts/contact-table'
describe('ContactTable', () => {
  it('shows the Do Not Contact badge when flagged', () => {
    render(<ContactTable contacts={[{ id: '1', full_name: 'Joseph Lim', job_title: 'CEO', contact_type: 'Prospect', do_not_contact: true, last_contacted_at: null, companies: { name: 'PNH Group' } }]} />)
    expect(screen.getByText('Joseph Lim')).toBeInTheDocument()
    expect(screen.getByText('Do Not Contact')).toBeInTheDocument()
  })

  it('shows prospect contact methods and employee fit', () => {
    render(<ContactTable contacts={[{
      id: '2',
      full_name: 'Team at Acme',
      job_title: null,
      contact_type: 'Prospect',
      do_not_contact: false,
      last_contacted_at: null,
      emails: ['info@acme.example'],
      phones: ['+65 6123 4567'],
      best_employee: 'felix',
      best_score: 91,
      companies: { name: 'Acme' },
    }]} />)
    expect(screen.getByText('info@acme.example')).toBeInTheDocument()
    expect(screen.getByText('+65 6123 4567')).toBeInTheDocument()
    expect(screen.getByText('felix')).toBeInTheDocument()
    expect(screen.getByText('91')).toBeInTheDocument()
  })
})
