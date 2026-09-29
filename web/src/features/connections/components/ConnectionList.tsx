import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Link as RouterLink } from 'react-router'
import { buildConnectionDetailPath } from '@/app/paths'
import type { Connection } from '@/features/connections/schemas'
import { formatDateTime } from '@/shared/lib/formatters'
import { DeleteOutlined } from '@mui/icons-material'

interface ConnectionListProps {
  connections: Connection[]
  onRename: (connection: Connection) => void
  onDelete: (connection: Connection) => void
}

export function ConnectionList({ connections, onRename, onDelete }: ConnectionListProps) {
  return (
    <Paper variant="outlined">
      <List disablePadding>
        {connections.map((connection) => (
          <ListItem
            key={connection.id}
            divider
            disablePadding
            secondaryAction={
              <div className="flex gap-1">
                <IconButton aria-label={`Renomear ${connection.name}`} onClick={() => onRename(connection)}>
                  <EditOutlinedIcon />
                </IconButton>
                <IconButton aria-label={`Excluir ${connection.name}`} onClick={() => onDelete(connection)}>
                  <DeleteOutlined />
                </IconButton>
              </div>
            }
          >
            <ListItemButton
              component={RouterLink}
              to={buildConnectionDetailPath(connection.id)}
              className="pr-28"
            >
              <ListItemText
                primary={connection.name}
                secondary={`Criada em ${formatDateTime(connection.createdAt)}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}