import { Alert, Button, Link, TextField, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import { paths } from '@/app/paths'
import { signIn } from '@/features/auth/api'
import { getAuthErrorMessage } from '@/features/auth/authErrors'
import { loginSchema } from '@/features/auth/schemas'
import { useFormSubmit } from '@/shared/hooks/useFormSubmit'

export function LoginPage() {
  const { handleSubmit, fieldErrors, formError, isSubmitting } = useFormSubmit({
    schema: loginSchema,
    onSubmit: signIn,
    getErrorMessage: getAuthErrorMessage,
  })

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography variant="h5" component="h1">
          Entrar
        </Typography>
        <Typography color="text.secondary">Bem-vindo de volta! Acesse sua conta para continuar.</Typography>
      </div>

      <TextField
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        autoFocus
        fullWidth
        error={Boolean(fieldErrors.email)}
        helperText={fieldErrors.email}
      />

      <TextField
        name="password"
        type="password"
        label="Senha"
        autoComplete="current-password"
        fullWidth
        error={Boolean(fieldErrors.password)}
        helperText={fieldErrors.password}
      />

      {formError && <Alert severity="error">{formError}</Alert>}

      <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
        Entrar
      </Button>

      <Typography variant="body2" className="text-center">
        Não tem conta?{' '}
        <Link component={RouterLink} to={paths.register}>
          Criar conta
        </Link>
      </Typography>
    </form>
  )
}