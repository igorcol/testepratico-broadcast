import { IconButton, Paper, Skeleton } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ForumRoundedIcon from '@mui/icons-material/ForumRounded'
import { Link as RouterLink } from 'react-router'
import { buildConnectionDetailPath } from '@/app/paths'
import type { Connection } from '@/features/connections/schemas'
import { IconTile } from '@/shared/components/IconTile'
import { formatDateTime } from '@/shared/lib/formatters'
import { DeleteOutlined } from '@mui/icons-material'

const GRID_CLASSES = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

interface ConnectionListProps {
  connections: Connection[]
  onRename: (connection: Connection) => void
  onDelete: (connection: Connection) => void
}

export function ConnectionList({ connections, onRename, onDelete }: ConnectionListProps) {
  return (
    <ul className={GRID_CLASSES}>
      {connections.map((connection) => (
        <li key={connection.id}>
          <ConnectionCard connection={connection} onRename={onRename} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  )
}

export function ConnectionListSkeleton() {
  return (
    <ul className={GRID_CLASSES} aria-busy="true" aria-label="Carregando conexões">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index}>
          <Paper variant="outlined" className="flex flex-col gap-4 p-5">
            <Skeleton variant="rounded" width={44} height={44} />
            <div>
              <Skeleton width="60%" height={28} />
              <Skeleton width="45%" />
            </div>
          </Paper>
        </li>
      ))}
    </ul>
  )
}

interface ConnectionCardProps {
  connection: Connection
  onRename: (connection: Connection) => void
  onDelete: (connection: Connection) => void
}

function ConnectionCard({ connection, onRename, onDelete }: ConnectionCardProps) {
  return (
    <Paper
      variant="outlined"
      className="group relative flex h-full flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <IconTile icon={<ForumRoundedIcon />} />
        <div className="relative z-10 flex gap-1">
          <IconButton
            size="small"
            aria-label={`Renomear ${connection.name}`}
            onClick={() => onRename(connection)}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label={`Excluir ${connection.name}`}
            onClick={() => onDelete(connection)}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <RouterLink
          to={buildConnectionDetailPath(connection.id)}
          className="text-lg font-bold wrap-break-word text-slate-900 no-underline outline-none after:absolute after:inset-0"
        >
          {connection.name}
        </RouterLink>
        <p className="text-sm text-muted">Criada em {formatDateTime(connection.createdAt)}</p>
      </div>

      <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Abrir conexão
        <ArrowForwardRoundedIcon fontSize="small" className="transition group-hover:translate-x-1" />
      </span>
    </Paper>
  )
}