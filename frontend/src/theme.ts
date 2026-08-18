import { createTheme } from '@mui/material/styles'

/** Modern MUI theme — keeps the app's original blue/neutral palette, swapped onto Material components. */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2a6df0',
      dark: '#1c50b8',
      light: '#eaf1ff',
      contrastText: '#ffffff',
    },
    success: {
      main: '#1f9d55',
      light: '#e6f7ec',
    },
    error: {
      main: '#e0393f',
      light: '#fce9ea',
    },
    background: {
      default: '#f7f8fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#15181e',
      secondary: '#5a6270',
    },
    divider: 'rgba(21, 24, 30, 0.08)',
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: ['"DB Heavent"', 'sans-serif'].join(','),
    h1: { fontSize: '1.75rem', fontWeight: 800 },
    h2: { fontSize: '1.375rem', fontWeight: 800 },
    h3: { fontSize: '1.125rem', fontWeight: 700 },
    button: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 10 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid rgba(21, 24, 30, 0.08)',
          boxShadow: '0 1px 2px rgba(16,24,40,.03), 0 8px 24px rgba(16,24,40,.04)',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: { borderBottom: '1px solid rgba(21, 24, 30, 0.08)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
  },
})
