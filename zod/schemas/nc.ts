import { z } from 'zod'

export const createNcSchema = z.object({
  title: z.string().min(3),
  description: z.string().nullable().optional(),
  department_id: z.string().nullable().optional(),
  workshop_id: z.string().nullable().optional(),
  detected_by: z.string().nullable().optional(),
  detected_at: z.string().nullable().optional(),
  severity: z.enum(['low','medium','high','critical']).optional(),
  photos: z.array(z.object({ key: z.string(), url: z.string().optional() })).nullable().optional(),
  related_audit: z.string().nullable().optional(),
  assigned_to: z.string().nullable().optional(),
  due_date: z.string().nullable().optional()
})

export type CreateNcInput = z.infer<typeof createNcSchema>

export default createNcSchema
