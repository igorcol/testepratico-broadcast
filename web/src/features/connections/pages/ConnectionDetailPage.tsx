import type { SyntheticEvent } from 'react'
import { Alert, Button, Paper, Skeleton, Tab, Tabs, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Link as RouterLink, useParams, useSearchParams } from 'react-router'
import { paths } from '@/app/paths'
import { useConnection } from '@/features/connections/hooks/useConnection'
import type { Connection } from '@/features/connections/schemas'
import { EmptyState } from '@/shared/components/EmptyState'
import type { SubscriptionState } from '@/shared/hooks/useFirestoreSubscription'
import { formatDateTime } from '@/shared/lib/formatters'
import { ContactsTab } from '@/features/contacts/components/ContactsTab'
import { MessagesTab } from '@/features/messages/components/MessagesTab'
import ForumRoundedIcon from '@mui/icons-material/ForumRounded'
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import { IconTile } from '@/shared/components/IconTile'

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

  if (view.status === 'loading') {
    return (
      <Paper variant="outlined" className="flex items-center gap-4 p-6">
        <Skeleton variant="rounded" width={56} height={56} />
        <div className="flex-1">
          <Skeleton width="40%" height={40} />
          <Skeleton width="25%" />
        </div>
      </Paper>
    )
  }

  if (view.status === 'not-found') return <ConnectionNotFound />

  if (view.status === 'error') {
    return <Alert severity="error">Não foi possível carregar a conexão. Recarregue a página.</Alert>
  }

    return (
    <>
      <Paper variant="outlined" className="overflow-hidden">
        <header className="flex flex-wrap items-center gap-4 p-6">
          <IconTile icon={<ForumRoundedIcon />} variant="gradient" size="lg" />
          <div className="min-w-0 flex-1">
            <Typography variant="h4" component="h1" className="wrap-break-word">
              {view.connection.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Criada em {formatDateTime(view.connection.createdAt)}
            </Typography>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success">
            <span aria-hidden className="size-2 rounded-full bg-success" />
            Ativa
          </span>
        </header>

        {/* Abas em pílula, a selecionada ganha fundo verde claro no lugar da linha embaixo */}
        <div className="border-t border-divider px-4 py-3">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            className="min-h-0 [&_.MuiTabs-indicator]:hidden **:[[role=tablist]]:gap-2"
          >
            <Tab
              label="Contatos"
              value="contacts"
              id="tab-contacts"
              aria-controls="tabpanel-contacts"
              icon={<PeopleAltRoundedIcon fontSize="small" />}
              iconPosition="start"
              className="min-h-0 rounded-xl px-4 py-2.5 aria-selected:bg-primary/10"
            />
            <Tab
              label="Mensagens"
              value="messages"
              id="tab-messages"
              aria-controls="tabpanel-messages"
              icon={<SendRoundedIcon fontSize="small" />}
              iconPosition="start"
              className="min-h-0 rounded-xl px-4 py-2.5 aria-selected:bg-primary/10"
            />
          </Tabs>
        </div>
      </Paper>

      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'contacts' ? (
          <ContactsTab connectionId={view.connection.id} />
        ) : (
          <MessagesTab connectionId={view.connection.id} />
        )}
      </div>
    </>
  )
}

function ConnectionNotFound() {
  return (
    <EmptyState
      icon={<LinkOffRoundedIcon />}
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