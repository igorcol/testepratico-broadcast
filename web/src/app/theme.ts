import { createTheme } from '@mui/material/styles'
import { ptBR } from '@mui/material/locale'

export const theme = createTheme(
  {
    cssVariables: true,
    palette: {
      primary: { main: '#4f46e5' },
      background: { default: '#f8fafc' },
    },
    typography: {
      fontFamily: '"Inter", system-ui, sans-serif',
    },
    shape: {
      borderRadius: 8,
    },
  },
  ptBR,
)