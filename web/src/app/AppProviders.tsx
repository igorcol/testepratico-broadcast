import type { ReactNode } from 'react'
import { CssBaseline, GlobalStyles } from '@mui/material'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { theme } from '@/app/theme'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ToastProvider } from '@/shared/toast/toastProvider'

const CSS_LAYER_ORDER = '@layer theme, base, mui, components, utilities;'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles={CSS_LAYER_ORDER} />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}