import { describe, it, expect } from 'vitest'
import { AI_MODELS, DEFAULT_MODEL, getModel, isValidModel, LEGACY_MODEL_IDS } from '@/lib/ai/models'

describe('AI model registry', () => {
  it('default is a current Claude model', () => {
    expect(getModel(DEFAULT_MODEL).providerModel).toBe('claude-sonnet-5-5')
  })

  it('offers no retired Claude 4 models', () => {
    const claude = AI_MODELS.filter((m) => m.provider === 'anthropic').map((m) => m.providerModel)
    expect(claude).toEqual(['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'])
  })

  it.each(Object.entries(LEGACY_MODEL_IDS))(
    'maps stored legacy id %s to %s so existing campaigns keep working',
    (legacy, current) => {
      expect(isValidModel(legacy)).toBe(true)
      expect(getModel(legacy).id).toBe(current)
    },
  )

  it('falls back to the default for unknown ids', () => {
    expect(isValidModel('gpt-2')).toBe(false)
    expect(getModel('gpt-2').id).toBe(DEFAULT_MODEL)
  })
})
