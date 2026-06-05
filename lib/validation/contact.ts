import { z } from 'zod'
import { LEAD_SOURCES, CONTACT_TYPES } from '@/lib/constants'
export const contactSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  job_title: z.string().optional(),
  company_id: z.string().uuid().optional().nullable(),
  emails: z.array(z.string().email()).default([]),
  phones: z.array(z.string()).default([]),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  lead_source: z.enum(LEAD_SOURCES as unknown as [string, ...string[]]).optional(),
  contact_type: z.enum(CONTACT_TYPES as unknown as [string, ...string[]]).optional(),
  do_not_contact: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
})
export type ContactInput = z.infer<typeof contactSchema>
