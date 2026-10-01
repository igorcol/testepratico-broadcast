import { Alert, Button, Link, TextField, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import { paths } from '@/app/paths'
import { signUp } from '@/features/auth/api'
import { getAuthErrorMessage } from '@/features/auth/authErrors'
import { registerSchema } from '@/features/auth/schemas'
import { useFormSubmit } from '@/shared/hooks/useFormSubmit'

export function RegisterPage() {
  const { handleSubmit, fieldErrors, formError, isSubmitting } = useFormSubmit({
    schema: registerSchema,
    onSubmit: ({ email, password }) => signUp({ email, password }),
    getErrorMessage: getAuthErrorMessage,
  })

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography variant="h5" component="h1">
          Criar conta
        </Typography>
        <Typography color="text.secondary">Comece a enviar mensagens em poucos minutos.</Typography>
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
        autoComplete="new-password"
        fullWidth
        error={Boolean(fieldErrors.password)}
        helperText={fieldErrors.password ?? 'Mínimo de 6 caracteres.'}
      />

      <TextField
        name="confirmPassword"
        type="password"
        label="Confirmar senha"
        autoComplete="new-password"
        fullWidth
        error={Boolean(fieldErrors.confirmPassword)}
        helperText={fieldErrors.confirmPassword}
      />

      {formError && <Alert severity="error">{formError}</Alert>}

      <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
        Criar conta
      </Button>

      <Typography variant="body2" className="text-center">
        Já tem conta?{' '}
        <Link component={RouterLink} to={paths.login}>
          Entrar
        </Link>
      </Typography>
    </form>
  )
}