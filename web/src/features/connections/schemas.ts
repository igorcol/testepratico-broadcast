import { z } from 'zod'
import { timestampSchema } from '@/shared/lib/firestore'

export const connectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.nullable(),
})

export type Connection = z.infer<typeof connectionSchema>

export const connectionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome da conexão.')
    .max(80, 'Use no máximo 80 caracteres.'),
})

export type ConnectionFormValues = z.infer<typeof connectionFormSchema>