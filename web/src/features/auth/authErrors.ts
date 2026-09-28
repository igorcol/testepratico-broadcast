import { FirebaseError } from 'firebase/app'

const DEFAULT_AUTH_ERROR_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

const authErrorMessages: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
}

export const getAuthErrorMessage = (error: unknown): string => {
    const mappedMessage =
        error instanceof FirebaseError ? authErrorMessages[error.code] : undefined

    if (!mappedMessage) {
        console.error('Unexpected auth error', error)
        return DEFAULT_AUTH_ERROR_MESSAGE
    }

    return mappedMessage
}