// On3oard CRM — AI model registry (shared by server routes and client picker).
// No server-only imports here. Adding a model = one entry below.

export type AiProvider = 'anthropic' | 'openai' | 'google' | 'deepseek'

export type AiModel = {
  id: string            // stable key used by the UI + sent to the API
  label: string         // shown in the picker
  provider: AiProvider
  providerModel: string // the provider's actual model name
  hint: string
}

export const AI_MODELS: AiModel[] = [
  // Claude (Anthropic)
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5', provider: 'anthropic', providerModel: 'claude-opus-5-5', hint: 'Deepest reasoning' },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5', provider: 'anthropic', providerModel: 'claude-sonnet-5-5', hint: 'Balanced' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5', provider: 'anthropic', providerModel: 'claude-haiku-5-5', hint: 'Fast & cheap' },
  // ChatGPT (OpenAI)
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai', providerModel: 'gpt-4o', hint: 'OpenAI flagship' },
  { id: 'gpt-4o-mini', label: 'GPT-4o mini', provider: 'openai', providerModel: 'gpt-4o-mini', hint: 'Fast & cheap' },
  // Gemini (Google)
  { id: 'gemini-2-5-pro', label: 'Gemini 2.5 Pro', provider: 'google', providerModel: 'gemini-2.5-pro', hint: 'Most capable' },
  { id: 'gemini-2-flash', label: 'Gemini 2.0 Flash', provider: 'google', providerModel: 'gemini-2.0-flash', hint: 'Fast & cheap' },
  // DeepSeek
  { id: 'deepseek-chat', label: 'DeepSeek V3', provider: 'deepseek', providerModel: 'deepseek-chat', hint: 'General' },
  { id: 'deepseek-reasoner', label: 'DeepSeek R1', provider: 'deepseek', providerModel: 'deepseek-reasoner', hint: 'Reasoning' },
]

export const DEFAULT_MODEL = 'claude-sonnet-5-5'

// Claude Opus 4 and Sonnet 4 were retired by Anthropic on 15 Jun 2026, and
// requests to them fail. Campaigns already in the database still store these
// old ids (and the 0005 migration's column default is 'claude-sonnet-4'), so
// map them to the current model in the same tier instead of rejecting them.
// Haiku 4.5 still works but is mapped to Haiku 5.5 (about 10x cheaper).
export const LEGACY_MODEL_IDS: Record<string, string> = {
  'claude-opus-4': 'claude-opus-5-5',
  'claude-sonnet-4': 'claude-sonnet-5-5',
  'claude-haiku-4-5': 'claude-haiku-5-5',
}

function canonicalId(id: unknown): unknown {
  return typeof id === 'string' && id in LEGACY_MODEL_IDS ? LEGACY_MODEL_IDS[id] : id
}

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  anthropic: 'Claude (Anthropic)',
  openai: 'ChatGPT (OpenAI)',
  google: 'Gemini (Google)',
  deepseek: 'DeepSeek',
}

export const PROVIDER_ENV: Record<AiProvider, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
}

export function isValidModel(id: unknown): id is string {
  const canonical = canonicalId(id)
  return typeof canonical === 'string' && AI_MODELS.some((m) => m.id === canonical)
}

export function getModel(id: unknown): AiModel {
  const canonical = canonicalId(id)
  return AI_MODELS.find((m) => m.id === canonical) ?? AI_MODELS.find((m) => m.id === DEFAULT_MODEL)!
}
