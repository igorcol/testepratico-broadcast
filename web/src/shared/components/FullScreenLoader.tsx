import { CircularProgress } from '@mui/material'

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <CircularProgress aria-label="Carregando" />
    </div>
  )
}