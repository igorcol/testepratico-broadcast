import { createContext } from 'react'
import type { AuthState } from '@/features/auth/types'

// Disponibiliza a sessão

export const AuthContext = createContext<AuthState | null>(null)