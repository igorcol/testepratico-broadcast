import { useCallback } from 'react'
import { subscribeToConnection } from '@/features/connections/api'
import type { Connection } from '@/features/connections/schemas'
import { useFirestoreSubscription, type Subscribe } from '@/shared/hooks/useFirestoreSubscription'

// Uma conexão em tempo real, null se o documento não existir
export const useConnection = (connectionId: string) => {
  const subscribe = useCallback<Subscribe<Connection | null>>(
    (onData, onError) => subscribeToConnection(connectionId, onData, onError),
    [connectionId],
  )

  return useFirestoreSubscription(subscribe)
}