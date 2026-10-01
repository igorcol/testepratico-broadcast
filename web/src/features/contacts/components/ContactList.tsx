import {
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import type { Contact } from '@/features/contacts/schemas'
import { getAvatarColorClasses, getInitials } from '@/shared/lib/avatar'
import { formatPhone } from '@/shared/lib/phone'
import { DeleteOutlined } from '@mui/icons-material'

interface ContactListProps {
  contacts: Contact[]
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
}

export function ContactList({ contacts, onEdit, onDelete }: ContactListProps) {
  return (
    <Paper variant="outlined" className="overflow-hidden">
      <List disablePadding>
        {contacts.map((contact) => (
          <ListItem
            key={contact.id}
            divider
            className="py-3 pr-28 transition-colors last:border-b-0 hover:bg-primary/3"
            secondaryAction={
              <div className="flex gap-1">
                <IconButton
                  size="small"
                  aria-label={`Editar ${contact.name}`}
                  onClick={() => onEdit(contact)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label={`Excluir ${contact.name}`}
                  onClick={() => onDelete(contact)}
                >
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </div>
            }
          >
            <ListItemAvatar>
              <Avatar aria-hidden className={`text-sm ${getAvatarColorClasses(contact.name)}`}>
                {getInitials(contact.name)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={contact.name}
              secondary={formatPhone(contact.phone)}
              slotProps={{
                primary: { className: 'font-semibold' },
                secondary: { className: 'tabular-nums' },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}