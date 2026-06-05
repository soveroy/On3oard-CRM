import { describe, it, expect } from 'vitest'
import { sgd } from '@/lib/format/currency'
import { shortDate } from '@/lib/format/date'
describe('formatters', () => {
  it('formats SGD without decimals', () => { expect(sgd(100800)).toBe('$100,800') })
  it('renders em dash for null date', () => { expect(shortDate(null)).toBe('—') })
})
