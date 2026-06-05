import { z } from 'zod'
import { DEFAULT_STAGES } from '@/lib/domain/stages'
import { ENGAGEMENT_TYPES, LEAD_SOURCES, PRIORITIES, LOST_REASONS } from '@/lib/constants'

export const dealSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company_id: z.string().uuid().optional().nullable(),
  primary_contact_id: z.string().uuid().optional().nullable(),
  engagement_type: z.enum(ENGAGEMENT_TYPES as unknown as [string, ...string[]]).optional(),
  value_sgd: z.coerce.number().min(0, 'Value must be ≥ 0').default(0),
  probability: z.coerce.number().int().min(0).max(100).optional(),
  close_date: z.string().optional().nullable(),
  stage: z.enum(DEFAULT_STAGES as unknown as [string, ...string[]]).default('Lead'),
  source: z.enum(LEAD_SOURCES as unknown as [string, ...string[]]).optional(),
  priority: z.enum(PRIORITIES as unknown as [string, ...string[]]).default('Medium'),
  lost_reason: z.enum(LOST_REASONS as unknown as [string, ...string[]]).optional(),
  tags: z.array(z.string()).default([]),
})

export type DealInput = z.infer<typeof dealSchema>
