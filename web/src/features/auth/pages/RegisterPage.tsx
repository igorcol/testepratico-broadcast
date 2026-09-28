import { Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import { paths } from '@/app/paths'

export function RegisterPage() {
  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h5" component="h1">
        Criar conta
      </Typography>
      <Link component={RouterLink} to={paths.login}>
        Já tenho conta
      </Link>
    </div>
  )
}