import { useState } from 'react'
import { Alert, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import ForumRoundedIcon from '@mui/icons-material/ForumRounded'
import { useAuthenticatedUser } from '@/features/auth/useAuth'
import { softDeleteConnection } from '@/features/connections/api'
import { ConnectionFormDialog } from '@/features/connections/components/ConnectionFormDialog'
import {
  ConnectionList,
  ConnectionListSkeleton,
} from '@/features/connections/components/ConnectionList'
import { useActiveConnections } from '@/features/connections/hooks/useActiveConnections'
import type { Connection } from '@/features/connections/schemas'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { GradientBanner } from '@/shared/components/GradientBanner'
import { getFirestoreErrorMessage } from '@/shared/lib/firestoreErrors'

type DialogState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'rename'; connection: Connection }
  | { type: 'delete'; connection: Connection }

const describeCount = (count: number) =>
  count === 1 ? '1 conexão ativa' : `${count} conexões ativas`

export function ConnectionsPage() {
  const { email } = useAuthenticatedUser()
  const connectionsState = useActiveConnections()
  const [dialog, setDialog] = useState<DialogState>({ type: 'closed' })

  const openCreateDialog = () => setDialog({ type: 'create' })
  const closeDialog = () => setDialog({ type: 'closed' })

  const greetingName = email?.split('@')[0] ?? ''

  return (
    <div className="flex flex-col gap-8">
      <GradientBanner
        eyebrow={greetingName ? `Olá, ${greetingName}` : undefined}
        title="Suas conexões"
        description={
          <div className="flex flex-col gap-3">
            <p>Cada conexão tem seus próprios contatos e mensagens.</p>
            {connectionsState.status === 'success' && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                <span aria-hidden className="size-2 rounded-full bg-white" />
                {describeCount(connectionsState.data.length)}
              </span>
            )}
          </div>
        }
        decorativeIcon={<CampaignRoundedIcon />}
        action={
          <Button
            variant="contained"
            color="inherit"
            size="large"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
            className="bg-white text-primary shadow-lg hover:bg-white/90"
          >
            Nova conexão
          </Button>
        }
      />

      {connectionsState.status === 'loading' && <ConnectionListSkeleton />}

      {connectionsState.status === 'error' && (
        <Alert severity="error">Não foi possível carregar as conexões. Recarregue a página.</Alert>
      )}

      {connectionsState.status === 'success' &&
        (connectionsState.data.length === 0 ? (
          <EmptyState
            icon={<ForumRoundedIcon />}
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
              A conexão <strong>{dialog.connection.name}</strong> sai da sua lista. Contatos e
              mensagens ficam guardados no histórico, e as mensagens agendadas dela são canceladas.
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