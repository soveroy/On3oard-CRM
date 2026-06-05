import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
vi.mock('next/image', () => ({ default: (props: Record<string, unknown>) => null }))
vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard' }))
import { Sidebar } from '@/components/layout/sidebar'
describe('Sidebar', () => {
  it('renders all nav items', () => {
    render(<Sidebar />)
    expect(screen.getByText('Deals')).toBeInTheDocument()
    expect(screen.getByText('Activities')).toBeInTheDocument()
  })
})
