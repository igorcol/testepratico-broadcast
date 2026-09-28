import type { ReactNode } from 'react'
import { CssBaseline, GlobalStyles } from '@mui/material'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { theme } from '@/app/theme'
import { AuthProvider } from '@/features/auth/AuthProvider'

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
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}