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
})
