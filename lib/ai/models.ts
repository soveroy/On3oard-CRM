// On3oard CRM — AI model registry.
// Shared by server routes and client pickers (no server-only imports here).
// Provider-agnostic by design: to add OpenAI/Gemini later, add entries with a new
// `provider` value and branch on it in the API routes (+ add that provider's key).

export type AiProvider = 'anthropic'

export type AiModel = {
  id: string
  label: string
  provider: AiProvider
  hint: string
}

export const AI_MODELS: AiModel[] = [
  { id: 'claude-opus-4-20250514', label: 'Claude Opus 4', provider: 'anthropic', hint: 'Deepest reasoning' },
  { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', provider: 'anthropic', hint: 'Balanced' },
  { id: 'claude-3-5-haiku-20241022', label: 'Claude Haiku 3.5', provider: 'anthropic', hint: 'Fastest & cheapest' },
]

export const DEFAULT_MODEL = 'claude-sonnet-4-20250514'

export function isValidModel(id: unknown): id is string {
  return typeof id === 'string' && AI_MODELS.some((m) => m.id === id)
}
