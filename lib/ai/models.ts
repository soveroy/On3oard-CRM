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
  { id: 'claude-opus-4', label: 'Claude Opus 4', provider: 'anthropic', providerModel: 'claude-opus-4-20250514', hint: 'Deepest reasoning' },
  { id: 'claude-sonnet-4', label: 'Claude Sonnet 4', provider: 'anthropic', providerModel: 'claude-sonnet-4-20250514', hint: 'Balanced' },
  { id: 'claude-haiku-3-5', label: 'Claude Haiku 3.5', provider: 'anthropic', providerModel: 'claude-3-5-haiku-20241022', hint: 'Fast & cheap' },
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

export const DEFAULT_MODEL = 'claude-sonnet-4'

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
  return typeof id === 'string' && AI_MODELS.some((m) => m.id === id)
}

export function getModel(id: unknown): AiModel {
  return AI_MODELS.find((m) => m.id === id) ?? AI_MODELS.find((m) => m.id === DEFAULT_MODEL)!
}
