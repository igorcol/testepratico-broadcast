import { Alert, Button, CircularProgress, Typography } from '@mui/material'
import { createConnection, softDeleteConnection } from '@/features/connections/api'
import { useConnections } from '@/features/connections/hooks/useConnections'
import { useAuthenticatedUser } from '@/features/auth/useAuth'

export function ConnectionsPage() {
  const { uid } = useAuthenticatedUser()
  const connectionsState = useConnections()

  const handleCreate = () => {
    const name = `Conexão ${new Date().toLocaleTimeString('pt-BR')}`
    createConnection(uid, { name }).catch((error: unknown) => console.error(error))
  }

  const handleDelete = (connectionId: string) => {
    softDeleteConnection(connectionId).catch((error: unknown) => console.error(error))
  }

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h4" component="h1">
        Conexões
      </Typography>
      <Button variant="contained" onClick={handleCreate} className="self-start">
        Criar conexão teste
      </Button>

      {connectionsState.status === 'loading' && <CircularProgress />}
      {connectionsState.status === 'error' && (
        <Alert severity="error">{connectionsState.error.message}</Alert>
      )}
      {connectionsState.status === 'success' &&
        connectionsState.data.map((connection) => (
          <div key={connection.id} className="flex items-center gap-4">
            <Typography>
              {connection.name} - {connection.createdAt.toLocaleString('pt-BR')}
            </Typography>
            <Button size="small" color="error" onClick={() => handleDelete(connection.id)}>
              Excluir
            </Button>
          </div>
        ))}
    </div>
  )
}