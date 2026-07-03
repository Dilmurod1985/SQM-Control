import { z } from 'zod'

export const auditResultSchema = z.object({
  item_id: z.string(),
  item_title: z.string(),
  status: z.string().optional(),
  score: z.number().nullable().optional(),
  comment: z.string().nullable().optional(),
  // photo: handled separately (upload to storage) - expect UploadMeta.key or null
  photo_key: z.string().nullable().optional(),
})

export const createAuditSchema = z.object({
  template_id: z.string().nullable().optional(),
  department_id: z.string().nullable().optional(),
  workshop_id: z.string().nullable().optional(),
  shift_id: z.string().nullable().optional(),
  performed_by: z.string().nullable().optional(),
  performed_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  attachments: z.array(z.object({ key: z.string(), url: z.string().optional() })).nullable().optional(),
  results: z.array(auditResultSchema).min(1),
})

export type CreateAuditInput = z.infer<typeof createAuditSchema>

export default createAuditSchema
