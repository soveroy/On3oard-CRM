import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HealthDot } from '@/components/deals/health-dot'
describe('HealthDot', () => {
  it('renders green for a high score', () => {
    render(<HealthDot score={80} />)
    expect(screen.getByLabelText('Health 80')).toHaveAttribute('data-color', 'green')
  })
  it('renders red for a low score', () => {
    render(<HealthDot score={20} />)
    expect(screen.getByLabelText('Health 20')).toHaveAttribute('data-color', 'red')
  })
})
