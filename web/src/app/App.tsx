import { auth, isUsingEmulators } from '@/shared/lib/firebase'

export function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-semibold text-primary">Broadcast</h1>
      <p>Projeto: {auth.app.options.projectId}</p>
      <p>Emuladores: {isUsingEmulators ? 'sim' : 'não'}</p>
    </main>
  )
}