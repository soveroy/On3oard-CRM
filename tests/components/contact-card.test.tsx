import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ContactCard } from '@/components/contacts/contact-card'

describe('ContactCard', () => {
  const props = {
    id: '123',
    name: 'John Doe',
    company: 'Acme Corp',
    phone: '555-1234',
    email: 'john@example.com',
  }

  it('renders contact name and company', () => {
    render(<ContactCard {...props} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders phone and email as clickable links', () => {
    render(<ContactCard {...props} />)
    expect(screen.getByRole('link', { name: /555-1234/i })).toHaveAttribute('href', 'tel:555-1234')
    expect(screen.getByRole('link', { name: /john@example.com/i })).toHaveAttribute('href', 'mailto:john@example.com')
  })

  it('renders action buttons', () => {
    const mockEdit = vi.fn()
    const mockDelete = vi.fn()
    render(<ContactCard {...props} onEdit={mockEdit} onDelete={mockDelete} />)
    expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })
})
