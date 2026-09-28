import type { User } from "firebase/auth";

export interface Credentials {
    email: string
    password: string
}

export type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' }

