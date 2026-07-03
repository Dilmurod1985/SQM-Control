import { z } from 'zod'

export const ccpLocationSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  accuracy: z.number().optional()
})

export const createCcpSchema = z.object({
  ccp_code: z.string(),
  department_id: z.string().nullable().optional(),
  workshop_id: z.string().nullable().optional(),
  measured_by: z.string().nullable().optional(),
  measured_at: z.string().nullable().optional(),
  measurement_value: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  pass: z.boolean().optional(),
  notes: z.string().nullable().optional(),
  // optional base64 photo (data without prefix)
  photo_base64: z.string().nullable().optional(),
  photo_name: z.string().nullable().optional(),
  location: ccpLocationSchema.nullable().optional()
})

export type CreateCcpInput = z.infer<typeof createCcpSchema>

export default createCcpSchema
