import { useState } from 'react'
import { Button, Typography } from '@mui/material'
import { logOut, signIn, signUp } from '@/features/auth/api'
import { getAuthErrorMessage } from '@/features/auth/authErrors'
import { useAuth } from '@/features/auth/useAuth'

const TEST_CREDENTIALS = { email: 'teste@teste.com', password: '123456' }

export function LoginPage() {
  const authState = useAuth()
  const [errorMessage, setErrorMessage] = useState('')

  const runAction = async (action: () => Promise<unknown>) => {
    setErrorMessage('')
    try {
      await action()
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Typography>
        Status: {authState.status}
        {authState.status === 'authenticated' && ` (${authState.user.email})`}
      </Typography>
      <Button variant="outlined" onClick={() => runAction(() => signUp(TEST_CREDENTIALS))}>
        Cadastrar teste
      </Button>
      <Button variant="outlined" onClick={() => runAction(() => signIn(TEST_CREDENTIALS))}>
        Entrar teste
      </Button>
      <Button variant="outlined" onClick={() => runAction(logOut)}>
        Sair
      </Button>
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
    </div>
  )
}