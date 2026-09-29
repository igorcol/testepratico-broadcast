import { useState } from 'react'
import { Alert, Button, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { softDeleteConnection } from '@/features/connections/api'
import { ConnectionFormDialog } from '@/features/connections/components/ConnectionFormDialog'
import { ConnectionList } from '@/features/connections/components/ConnectionList'
import { useConnections } from '@/features/connections/hooks/useConnections'
import type { Connection } from '@/features/connections/schemas'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ListSkeleton } from '@/shared/components/ListSkeleton'
import { getFirestoreErrorMessage } from '@/shared/lib/firestoreErrors'

type DialogState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'rename'; connection: Connection }
  | { type: 'delete'; connection: Connection }

export function ConnectionsPage() {
  const connectionsState = useConnections()
  const [dialog, setDialog] = useState<DialogState>({ type: 'closed' })

  const openCreateDialog = () => setDialog({ type: 'create' })
  const closeDialog = () => setDialog({ type: 'closed' })

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography variant="h4" component="h1">
            Conexões
          </Typography>
          <Typography color="text.secondary">
            Cada conexão tem seus próprios contatos e mensagens.
          </Typography>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Nova conexão
        </Button>
      </header>

      {connectionsState.status === 'loading' && <ListSkeleton />}

      {connectionsState.status === 'error' && (
        <Alert severity="error">Não foi possível carregar as conexões. Recarregue a página.</Alert>
      )}

      {connectionsState.status === 'success' &&
        (connectionsState.data.length === 0 ? (
          <EmptyState
            title="Nenhuma conexão ainda"
            description="Crie sua primeira conexão para cadastrar contatos e enviar mensagens."
            action={
              <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreateDialog}>
                Criar conexão
              </Button>
            }
          />
        ) : (
          <ConnectionList
            connections={connectionsState.data}
            onRename={(connection) => setDialog({ type: 'rename', connection })}
            onDelete={(connection) => setDialog({ type: 'delete', connection })}
          />
        ))}

      {dialog.type === 'create' && <ConnectionFormDialog onClose={closeDialog} />}

      {dialog.type === 'rename' && (
        <ConnectionFormDialog connection={dialog.connection} onClose={closeDialog} />
      )}

      {dialog.type === 'delete' && (
        <ConfirmDialog
          title="Excluir conexão?"
          description={
            <>
              A conexão <strong>{dialog.connection.name}</strong> sairá da sua lista. Contatos e
              mensagens ficam guardados no histórico, e as mensagens agendadas serão canceladas.
            </>
          }
          confirmLabel="Excluir"
          onConfirm={() => softDeleteConnection(dialog.connection.id)}
          onClose={closeDialog}
          getErrorMessage={getFirestoreErrorMessage}
        />
      )}
    </div>
  )
}