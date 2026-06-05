import { z } from 'zod'
export const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  avatar_url: z.string().url().optional().or(z.literal('')),
  role: z.string().optional(),
})
export const stringListSchema = z.array(z.string().min(1)).min(1, 'Add at least one item')
export const staleThresholdSchema = z.coerce.number().int().min(1).max(365)
export type ProfileInput = z.infer<typeof profileSchema>
