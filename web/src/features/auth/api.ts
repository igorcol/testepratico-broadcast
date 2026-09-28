import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import type { Credentials } from '@/features/auth/types'
import { auth } from '@/shared/lib/firebase'

// * SIGN UP 
export const signUp = async ({email, password}: Credentials): Promise<User> => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    return user
}

// * SIGN IN
export const signIn = async ({ email, password }: Credentials): Promise<User> => {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
}

// * LOG OUT
export const logOut = (): Promise<void> => signOut(auth)

export const subscribeToAuthState = (onChange: (user: User | null) => void) => onAuthStateChanged(auth, onChange)