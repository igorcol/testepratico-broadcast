import { useCallback } from 'react'
import { subscribeToConnections } from '@/features/connections/api'
import type { Connection } from '@/features/connections/schemas'
import { useAuthenticatedUser } from '@/features/auth/useAuth'
import { useFirestoreSubscription, type Subscribe } from '@/shared/hooks/useFirestoreSubscription'

export const useConnections = () => {
  const { uid } = useAuthenticatedUser()

  const subscribe = useCallback<Subscribe<Connection[]>>(
    (onData, onError) => subscribeToConnections(uid, onData, onError),
    [uid],
  )

  return useFirestoreSubscription(subscribe)
}