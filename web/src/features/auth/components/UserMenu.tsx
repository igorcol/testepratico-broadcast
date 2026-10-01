import { useState } from 'react'
import { Avatar, ButtonBase, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LogoutIcon from '@mui/icons-material/Logout'
import { logOut } from '@/features/auth/api'
import { useAuthenticatedUser } from '@/features/auth/useAuth'

const USER_MENU_ID = 'user-menu'

export function UserMenu() {
  const user = useAuthenticatedUser()
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null)

  const email = user.email ?? ''
  const isOpen = anchorElement !== null
  const closeMenu = () => setAnchorElement(null)

  const handleLogout = async () => {
    closeMenu()
    try {
      await logOut()
    } catch (error) {
      console.error('Failed to sign out', error)
    }
  }

  return (
    <>
      <ButtonBase
        onClick={(event) => setAnchorElement(event.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? USER_MENU_ID : undefined}
        aria-label="Abrir menu da conta"
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-primary/5"
      >
        <Avatar className="size-8 bg-brand-gradient text-sm">{email.charAt(0).toUpperCase()}</Avatar>
        <span className="hidden text-sm font-medium text-slate-700 sm:block">{email}</span>
        <KeyboardArrowDownIcon fontSize="small" className="text-muted" />
      </ButtonBase>

      <Menu
        id={USER_MENU_ID}
        anchorEl={anchorElement}
        open={isOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { className: 'mt-2 min-w-60' } }}
      >
        <li role="presentation" className="px-4 pt-1 pb-2">
          <Typography variant="caption" color="text.secondary">
            Conectado como
          </Typography>
          <Typography variant="body2" className="font-semibold break-all">
            {email}
          </Typography>
        </li>
        <Divider component="li" />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </>
  )
}