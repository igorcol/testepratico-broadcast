import { createContext } from 'react'
import type { AuthState } from '@/features/auth/types'

export const AuthContext = createContext<AuthState | null>(null)