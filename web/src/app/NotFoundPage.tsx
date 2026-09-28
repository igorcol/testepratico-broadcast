import { Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import { paths } from '@/app/paths'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <Typography variant="h4" component="h1">
        Página não encontrada
      </Typography>
      <Button component={RouterLink} to={paths.connections} variant="contained">
        Voltar para o início
      </Button>
    </main>
  )
}