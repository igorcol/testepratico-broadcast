import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/app/layouts/AppLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { NotFoundPage } from '@/app/NotFoundPage'
import { paths } from '@/app/paths'
import { RedirectIfAuthenticated } from '@/features/auth/components/RedirectIfAuthenticated'
import { RequireAuth } from '@/features/auth/components/RequireAuth'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ConnectionDetailPage } from '@/features/connections/pages/ConnectionDetailPage'
import { ConnectionsPage } from '@/features/connections/pages/ConnectionsPage'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={paths.connections} replace /> },
  {
    element: <RedirectIfAuthenticated />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: paths.login, element: <LoginPage /> },
          { path: paths.register, element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: paths.connections, element: <ConnectionsPage /> },
          { path: paths.connectionDetail, element: <ConnectionDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])