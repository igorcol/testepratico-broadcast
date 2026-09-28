import { z } from 'zod'

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  VITE_USE_FIREBASE_EMULATORS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
})

const parsedEnv = envSchema.safeParse(import.meta.env)

if (!parsedEnv.success) {
  const invalidKeys = parsedEnv.error.issues
    .map((issue) => issue.path.join('.'))
    .join(', ')
  throw new Error(`Invalid or missing environment variables: ${invalidKeys}`)
}

export const env = parsedEnv.data