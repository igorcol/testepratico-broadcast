import { Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import { buildConnectionDetailPath } from '@/app/paths'

export function ConnectionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h4" component="h1">
        Conexões
      </Typography>
      <Link component={RouterLink} to={buildConnectionDetailPath('conexao-teste')}>
        Abrir conexão de teste
      </Link>
    </div>
  )
}