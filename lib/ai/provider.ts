import 'server-only'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { deepseek } from '@ai-sdk/deepseek'
import type { LanguageModel } from 'ai'
import { getModel, PROVIDER_ENV, type AiModel } from './models'

// Each provider reads its API key from its default env var (PROVIDER_ENV).
export function resolveLanguageModel(modelId: string): { model: LanguageModel; meta: AiModel } {
  const meta = getModel(modelId)
  const name = meta.providerModel
  switch (meta.provider) {
    case 'anthropic': return { model: anthropic(name), meta }
    case 'openai': return { model: openai(name), meta }
    case 'google': return { model: google(name), meta }
    case 'deepseek': return { model: deepseek(name), meta }
  }
}

/** True if the API key for this model's provider is present in the environment. */
export function providerConfigured(meta: AiModel): boolean {
  return Boolean(process.env[PROVIDER_ENV[meta.provider]])
}
