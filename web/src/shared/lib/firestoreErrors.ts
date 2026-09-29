import { FirebaseError } from 'firebase/app'

const DEFAULT_FIRESTORE_ERROR_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

const firestoreErrorMessages: Record<string, string> = {
  'permission-denied': 'Você não tem permissão para fazer isso.',
  unavailable: 'Sem conexão com o servidor. Verifique sua internet.',
  'not-found': 'Esse item não existe mais.',
}

export const getFirestoreErrorMessage = (error: unknown): string => {
  const mappedMessage =
    error instanceof FirebaseError ? firestoreErrorMessages[error.code] : undefined

  if (!mappedMessage) {
    console.error('Unexpected Firestore error', error)
    return DEFAULT_FIRESTORE_ERROR_MESSAGE
  }

  return mappedMessage
}