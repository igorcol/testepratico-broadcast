import { AppBar, Container, Toolbar } from '@mui/material'
import { Link as RouterLink, Outlet } from 'react-router'
import { paths } from '@/app/paths'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { BrandLogo } from '@/shared/components/BrandLogo'

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        className="border-b border-divider bg-surface/80 backdrop-blur-md"
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters className="gap-4">
            <RouterLink to={paths.connections} aria-label="Ir para conexões" className="no-underline">
              <BrandLogo />
            </RouterLink>
            <div className="ml-auto">
              <UserMenu />
            </div>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" maxWidth="lg" className="py-8">
        <Outlet />
      </Container>
    </div>
  )
}