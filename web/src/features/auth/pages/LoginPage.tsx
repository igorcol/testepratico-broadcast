import { Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import { paths } from '@/app/paths'

export function LoginPage() {
  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h5" component="h1">
        Entrar
      </Typography>
      <Link component={RouterLink} to={paths.register}>
        Criar conta
      </Link>
    </div>
  )
}