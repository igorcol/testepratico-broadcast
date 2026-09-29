import { useCallback } from 'react'
import { useAuthenticatedUser } from '@/features/auth/useAuth'
import { subscribeToContacts } from '@/features/contacts/api'
import type { Contact } from '@/features/contacts/schemas'
import { useFirestoreSubscription, type Subscribe } from '@/shared/hooks/useFirestoreSubscription'

// Contatos de uma conexão em tempo real
// Troca de inscrição quando muda a conexão
export const useContacts = (connectionId: string) => {
  const { uid } = useAuthenticatedUser()

  const subscribe = useCallback<Subscribe<Contact[]>>(
    (onData, onError) => subscribeToContacts(uid, connectionId, onData, onError),
    [uid, connectionId],
  )

  return useFirestoreSubscription(subscribe)
}