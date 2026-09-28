import { createTheme } from '@mui/material/styles'
import { ptBR } from '@mui/material/locale'

export const theme = createTheme(
  {
    cssVariables: true,
    palette: {
      primary: { main: '#4f46e5' },
    },
    typography: {
      fontFamily: '"Inter", system-ui, sans-serif',
    },
  },
  ptBR,
)