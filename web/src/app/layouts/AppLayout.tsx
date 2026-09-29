import { AppBar, Button, Container, Toolbar, Typography } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { Link as RouterLink, Outlet } from 'react-router'
import { paths } from '@/app/paths'
import { logOut } from '@/features/auth/api'
import { useAuthenticatedUser } from '@/features/auth/useAuth'

export function AppLayout() {
  const user = useAuthenticatedUser()

  const handleLogout = async () => {
    try {
      await logOut()
    } catch (error) {
      console.error('Failed to sign out', error)
    }
  }

  return (
    <div className="min-h-screen">
      <AppBar position="sticky" color="inherit" elevation={0} className="border-b border-divider">
        <Toolbar className="gap-4">
          <Typography
            component={RouterLink}
            to={paths.connections}
            variant="h6"
            className="font-semibold text-primary no-underline"
          >
            Broadcast
          </Typography>

          <Typography variant="body2" color="text.secondary" className="ml-auto hidden sm:block">
            {user.email}
          </Typography>

          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" className="py-8">
        <Outlet />
      </Container>
    </div>
  )
}