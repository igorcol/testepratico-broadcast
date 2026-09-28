import { useEffect, useState, type ReactNode } from 'react'
import { subscribeToAuthState } from '@/features/auth/api'
import { AuthContext } from '@/features/auth/authContext'
import type { AuthState } from '@/features/auth/types'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' })

  useEffect(
    () =>
      subscribeToAuthState((user) => {
        setAuthState(user ? { status: 'authenticated', user } : { status: 'unauthenticated' })
      }),
    [],
  )

  return <AuthContext value={authState}>{children}</AuthContext>
}