import { useEffect, useState } from 'react'
import type { FirestoreError, Unsubscribe } from 'firebase/firestore'

export type Subscribe<T> = (
  onData: (data: T) => void,
  onError: (error: FirestoreError) => void,
) => Unsubscribe

export type SubscriptionState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: FirestoreError }

interface SettledSubscription<T> {
  source: Subscribe<T>
  state: SubscriptionState<T>
}

export const useFirestoreSubscription = <T>(subscribe: Subscribe<T>): SubscriptionState<T> => {
  const [settled, setSettled] = useState<SettledSubscription<T> | null>(null)

  useEffect(
    () =>
      subscribe(
        (data) => setSettled({ source: subscribe, state: { status: 'success', data } }),
        (error) => {
          console.error('Firestore subscription failed', error)
          setSettled({ source: subscribe, state: { status: 'error', error } })
        },
      ),
    [subscribe],
  )

  return settled?.source === subscribe ? settled.state : { status: 'loading' }
}