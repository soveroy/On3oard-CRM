import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FAB } from '@/components/ui/fab'
import { Plus } from 'lucide-react'

describe('FAB Component', () => {
  it('renders with icon and label', () => {
    const handleClick = vi.fn()
    render(
      <FAB icon={Plus} label="Add Item" onClick={handleClick} />
    )
    const button = screen.getByRole('button', { name: /add item/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(
      <FAB icon={Plus} label="Add Item" onClick={handleClick} />
    )
    const button = screen.getByRole('button')
    button.click()
    expect(handleClick).toHaveBeenCalled()
  })

  it('has correct styling classes', () => {
    const handleClick = vi.fn()
    const { container } = render(
      <FAB icon={Plus} label="Add Item" onClick={handleClick} />
    )
    const button = container.querySelector('button')
    expect(button).toHaveClass('fixed', 'bottom-20', 'w-14', 'h-14', 'rounded-full', 'md:hidden')
  })
})
