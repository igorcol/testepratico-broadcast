import { Timestamp, type DocumentSnapshot } from 'firebase/firestore'
import { z } from 'zod'

const SNAPSHOT_OPTIONS = { serverTimestamps: 'estimate' } as const

export const timestampSchema = z.instanceof(Timestamp).transform((timestamp) => timestamp.toDate())

export const parseDocument = <T>(schema: z.ZodType<T>, snapshot: DocumentSnapshot): T | null => {
  const parsed = schema.safeParse({ id: snapshot.id, ...snapshot.data(SNAPSHOT_OPTIONS) })

  if (!parsed.success) {
    console.error(`Invalid document at ${snapshot.ref.path}`, parsed.error)
    return null
  }

  return parsed.data
}