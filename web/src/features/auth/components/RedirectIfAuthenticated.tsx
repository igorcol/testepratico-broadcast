import { Navigate, Outlet, useLocation } from 'react-router'
import { paths } from '@/app/paths'
import { useAuth } from '@/features/auth/useAuth'
import { FullScreenLoader } from '@/shared/components/FullScreenLoader'

const getRedirectPath = (locationState: unknown): string => {
  if (
    typeof locationState === 'object' &&
    locationState !== null &&
    'from' in locationState &&
    typeof locationState.from === 'string'
  ) {
    return locationState.from
  }

  return paths.connections
}

export function RedirectIfAuthenticated() {
  const authState = useAuth()
  const location = useLocation()

  if (authState.status === 'loading') return <FullScreenLoader />

  if (authState.status === 'authenticated') {
    return <Navigate to={getRedirectPath(location.state)} replace />
  }

  return <Outlet />
}