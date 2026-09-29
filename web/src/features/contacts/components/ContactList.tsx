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
import { formatPhone } from '@/shared/lib/phone'
import { DeleteOutlined } from '@mui/icons-material'

interface ContactListProps {
  contacts: Contact[]
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
}

export function ContactList({ contacts, onEdit, onDelete }: ContactListProps) {
  return (
    <Paper variant="outlined">
      <List disablePadding>
        {contacts.map((contact) => (
          <ListItem
            key={contact.id}
            divider
            className="pr-28"
            secondaryAction={
              <div className="flex gap-1">
                <IconButton aria-label={`Editar ${contact.name}`} onClick={() => onEdit(contact)}>
                  <EditOutlinedIcon />
                </IconButton>
                <IconButton aria-label={`Excluir ${contact.name}`} onClick={() => onDelete(contact)}>
                  <DeleteOutlined />
                </IconButton>
              </div>
            }
          >
            <ListItemAvatar>
              <Avatar aria-hidden>{contact.name.trim().charAt(0).toUpperCase()}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={contact.name} secondary={formatPhone(contact.phone)} />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}