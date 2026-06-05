import { z } from 'zod'
import { INDUSTRIES, COMPANY_SIZES } from '@/lib/constants'
export const companySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.enum(INDUSTRIES as unknown as [string, ...string[]]).optional(),
  size: z.enum(COMPANY_SIZES as unknown as [string, ...string[]]).optional(),
  country: z.string().default('Singapore'),
  uen: z.string().optional(),
  revenue_range: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
})
export type CompanyInput = z.infer<typeof companySchema>
