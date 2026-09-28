import { Button } from '@mui/material'

export function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold text-primary">Broadcast</h1>
      <Button variant="contained" className="rounded-full px-8">
        Teste de camadas
      </Button>
    </main>
  )
}