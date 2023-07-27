import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: { fontFamily: 'Roboto, sans-serif' },
  palette: {
    primary: {
      light: '#039686',
      main: '#6750a4',
      dark: '#004d3e',
      slight: '#8fc2bb',
      contrastText: '#fff'
    },
    secondary: {
      light: '#b32126',
      main: '#625b71',
      dark: '#790111',
      contrastText: '#fff'
    },
    tertiary: {
      light: '#dbc584',
      main: '#7d5260',
      dark: '#dbb032',
      contrastText: '#fff'
    },
    status: {
      danger: '#b3261e'
    },
    neutral: {
      main: '#64748B',
      contrastText: '#fff'
    }
  }
});

export default theme;
