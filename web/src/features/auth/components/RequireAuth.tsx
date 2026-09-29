import { Navigate, Outlet, useLocation } from 'react-router'
import { paths } from '@/app/paths'
import { useAuth } from '@/features/auth/useAuth'
import { FullScreenLoader } from '@/shared/components/FullScreenLoader'

export function RequireAuth() {
  const authState = useAuth()
  const location = useLocation()

  if (authState.status === 'loading') return <FullScreenLoader />

  if (authState.status === 'unauthenticated') {
    // Guarda a rota original pra voltar pra ela depois do login
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}