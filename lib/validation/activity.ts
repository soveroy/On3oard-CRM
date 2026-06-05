import { z } from 'zod'
import { ACTIVITY_TYPES, OUTCOMES } from '@/lib/constants'
export const activitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES as unknown as [string, ...string[]]),
  subject: z.string().optional(),
  deal_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  activity_date: z.string().optional(),
  duration_mins: z.coerce.number().int().positive().optional(),
  outcome: z.enum(OUTCOMES as unknown as [string, ...string[]]).optional(),
  next_action: z.string().optional(),
  next_action_due: z.string().optional().nullable(),
  notes: z.string().optional(),
})
export type ActivityInput = z.infer<typeof activitySchema>
