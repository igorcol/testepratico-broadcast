import { AppBar, Container, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, Outlet } from 'react-router'
import { paths } from '@/app/paths'

export function AppLayout() {
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
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" className="py-8">
        <Outlet />
      </Container>
    </div>
  )
}