import { createTheme } from '@mui/material/styles'
import { ptBR } from '@mui/material/locale'

// Cores da marca, verde do universo WhatsApp
const BRAND_DARK = '#0F766E'
const BRAND_LIGHT = '#10B981'

const SLATE_900 = '#0F172A'
const SLATE_500 = '#64748B'
const BORDER = '#CBD5E1'
const BORDER_HOVER = '#94A3B8'

export const brandGradient = `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND_LIGHT} 100%)`

export const softShadow = '0 1px 2px rgb(16 24 40 / 0.04), 0 8px 24px rgb(15 118 110 / 0.08)'

export const theme = createTheme(
  {
    cssVariables: true,
    palette: {
      primary: { main: BRAND_DARK, light: BRAND_LIGHT, dark: '#115E59', contrastText: '#FFFFFF' },
      success: { main: '#059669', contrastText: '#FFFFFF' },
      warning: { main: '#D97706', contrastText: '#FFFFFF' },
      error: { main: '#DC2626' },
      background: { default: '#F3F7F6', paper: '#FFFFFF' },
      text: { primary: SLATE_900, secondary: SLATE_500 },
      divider: BORDER,
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      h4: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: [
              'radial-gradient(1200px 600px at 100% -10%, rgb(16 185 129 / 0.08), transparent 60%)',
              'radial-gradient(800px 500px at -10% 10%, rgb(15 118 110 / 0.06), transparent 60%)',
            ].join(', '),
            backgroundAttachment: 'fixed',
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              transitionDuration: '0.01ms !important',
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 12,
            paddingInline: 18,
            variants: [
              {
                props: { variant: 'contained', color: 'primary' },
                style: {
                  backgroundImage: brandGradient,
                  boxShadow: '0 6px 16px rgb(15 118 110 / 0.25)',
                  '&:hover': {
                    boxShadow: '0 8px 20px rgb(15 118 110 / 0.35)',
                    filter: 'brightness(1.05)',
                  },
                  '&.Mui-disabled': { backgroundImage: 'none', boxShadow: 'none' },
                },
              },
            ],
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 16 },
          outlined: { borderColor: 'rgb(15 23 42 / 0.06)', boxShadow: softShadow },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            [`&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline`]: {
              borderColor: BORDER_HOVER,
            },
          },
          notchedOutline: { borderColor: BORDER },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20 },
          paperFullScreen: { borderRadius: 0 },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { fontWeight: 700, fontSize: '1.125rem' },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { height: 3, borderRadius: 3 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', minHeight: 48 },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { fontWeight: 700 },
        },
      },
    },
  },
  ptBR,
)