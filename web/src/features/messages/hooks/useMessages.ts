import { useCallback } from 'react'
import { useAuthenticatedUser } from '@/features/auth/useAuth'
import { subscribeToMessages } from '@/features/messages/api'
import type { Message } from '@/features/messages/schemas'
import { useFirestoreSubscription, type Subscribe } from '@/shared/hooks/useFirestoreSubscription'

// Mensagens de uma conexão em tempo real
export const useMessages = (connectionId: string) => {
  const { uid } = useAuthenticatedUser()

  const subscribe = useCallback<Subscribe<Message[]>>(
    (onData, onError) => subscribeToMessages(uid, connectionId, onData, onError),
    [uid, connectionId],
  )

  return useFirestoreSubscription(subscribe)
}