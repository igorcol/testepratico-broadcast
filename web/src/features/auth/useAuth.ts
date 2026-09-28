import { useContext } from 'react'
import { AuthContext } from '@/features/auth/authContext'
import type { AuthState } from '@/features/auth/types'


export const useAuth = (): AuthState => {
    const authState = useContext(AuthContext)

    if (!authState) {
        throw new Error('useAuth must be used within AuthProvider')
    }

    return authState
}