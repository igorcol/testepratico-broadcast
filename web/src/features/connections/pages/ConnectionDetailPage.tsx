import type { SyntheticEvent } from 'react'
import { Alert, Button, Skeleton, Tab, Tabs, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Link as RouterLink, useParams, useSearchParams } from 'react-router'
import { paths } from '@/app/paths'
import { useConnection } from '@/features/connections/hooks/useConnection'
import type { Connection } from '@/features/connections/schemas'
import { EmptyState } from '@/shared/components/EmptyState'
import type { SubscriptionState } from '@/shared/hooks/useFirestoreSubscription'
import { formatDateTime } from '@/shared/lib/formatters'
import { ContactsTab } from '@/features/contacts/components/ContactsTab'

const CONNECTION_TABS = ['contacts', 'messages'] as const

type ConnectionTab = (typeof CONNECTION_TABS)[number]

const isConnectionTab = (value: string | null): value is ConnectionTab =>
  CONNECTION_TABS.some((tab) => tab === value)

type ConnectionView =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error' }
  | { status: 'ready'; connection: Connection }


const toConnectionView = (state: SubscriptionState<Connection | null>): ConnectionView => {
  if (state.status === 'loading') return { status: 'loading' }

  if (state.status === 'error') {
    return state.error.code === 'permission-denied' ? { status: 'not-found' } : { status: 'error' }
  }

  if (!state.data || state.data.deletedAt) return { status: 'not-found' }

  return { status: 'ready', connection: state.data }
}

export function ConnectionDetailPage() {
  const { connectionId } = useParams()

  return (
    <div className="flex flex-col gap-6">
      <Button
        component={RouterLink}
        to={paths.connections}
        startIcon={<ArrowBackIcon />}
        className="self-start"
      >
        Conexões
      </Button>

      {connectionId ? <ConnectionDetail connectionId={connectionId} /> : <ConnectionNotFound />}
    </div>
  )
}

interface ConnectionDetailProps {
  connectionId: string
}

function ConnectionDetail({ connectionId }: ConnectionDetailProps) {
  const view = toConnectionView(useConnection(connectionId))
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab')
  const activeTab: ConnectionTab = isConnectionTab(tabParam) ? tabParam : 'contacts'

  const handleTabChange = (_event: SyntheticEvent, tab: ConnectionTab) => {
    setSearchParams(
      (params) => {
        params.set('tab', tab)
        return params
      },
      { replace: true },
    )
  }

  if (view.status === 'loading') return <Skeleton variant="text" width={280} height={48} />

  if (view.status === 'not-found') return <ConnectionNotFound />

  if (view.status === 'error') {
    return <Alert severity="error">Não foi possível carregar a conexão. Recarregue a página.</Alert>
  }

  return (
    <>
      <header>
        <Typography variant="h4" component="h1">
          {view.connection.name}
        </Typography>
        <Typography color="text.secondary">
          Criada em {formatDateTime(view.connection.createdAt)}
        </Typography>
      </header>

      <div>
        <Tabs value={activeTab} onChange={handleTabChange} className="border-b border-divider">
          <Tab label="Contatos" value="contacts" id="tab-contacts" aria-controls="tabpanel-contacts" />
          <Tab label="Mensagens" value="messages" id="tab-messages" aria-controls="tabpanel-messages" />
        </Tabs>

        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="pt-6"
        >
          {activeTab === 'contacts' ? (
            <ContactsTab connectionId={view.connection.id} />
          ) : (
            <EmptyState
              title="Mensagens em breve"
              description="..."
            />
          )}
        </div>
      </div>
    </>
  )
}

function ConnectionNotFound() {
  return (
    <EmptyState
      title="Conexão não encontrada"
      description="Ela pode ter sido excluída, ou o link está incorreto."
      action={
        <Button component={RouterLink} to={paths.connections} variant="outlined">
          Ver minhas conexões
        </Button>
      }
    />
  )
}