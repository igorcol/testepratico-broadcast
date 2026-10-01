import { Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import { paths } from '@/app/paths'
import { BrandLogo } from '@/shared/components/BrandLogo'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <BrandLogo size="lg" />
      <p aria-hidden className="bg-brand-gradient bg-clip-text text-8xl font-extrabold text-transparent">
        404
      </p>
      <div className="flex flex-col gap-1">
        <Typography variant="h5" component="h1">
          Página não encontrada
        </Typography>
        <Typography color="text.secondary">
          O endereço que você abriu não existe ou foi removido.
        </Typography>
      </div>
      <Button component={RouterLink} to={paths.connections} variant="contained" size="large">
        Voltar para o início
      </Button>
    </main>
  )
}