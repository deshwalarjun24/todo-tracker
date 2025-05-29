import { createTheme } from '@mui/material/styles';

// Nature-inspired color palette
const colors = {
  light: {
    primary: {
      main: '#4CAF50', // Forest green
      light: '#81C784',
      dark: '#388E3C',
      contrastText: '#fff',
    },
    secondary: {
      main: '#8BC34A', // Lime green
      light: '#AED581',
      dark: '#689F38',
      contrastText: '#fff',
    },
    background: {
      default: '#F9FBF7', // Soft off-white
      paper: '#FFFFFF',
      card: '#F1F8E9',
    },
    text: {
      primary: '#2E3B2E', // Dark forest green
      secondary: '#5C6D5C',
      disabled: '#A5B1A5',
    },
    success: {
      main: '#66BB6A',
      light: '#A5D6A7',
      dark: '#43A047',
    },
    info: {
      main: '#29B6F6',
      light: '#81D4FA',
      dark: '#0288D1',
    },
    warning: {
      main: '#FFA726',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#EF5350',
      light: '#E57373',
      dark: '#D32F2F',
    },
    divider: 'rgba(46, 59, 46, 0.12)',
  },
  dark: {
    primary: {
      main: '#388E3C', // Darker forest green
      light: '#4CAF50',
      dark: '#2E7D32',
      contrastText: '#fff',
    },
    secondary: {
      main: '#689F38', // Darker lime green
      light: '#8BC34A',
      dark: '#558B2F',
      contrastText: '#fff',
    },
    background: {
      default: '#1E2A1E', // Dark forest background
      paper: '#263426',
      card: '#2E3B2E',
    },
    text: {
      primary: '#E8F5E9', // Light mint
      secondary: '#C8E6C9',
      disabled: '#81C784',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    info: {
      main: '#0288D1',
      light: '#29B6F6',
      dark: '#01579B',
    },
    warning: {
      main: '#F57C00',
      light: '#FFA726',
      dark: '#E65100',
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#B71C1C',
    },
    divider: 'rgba(232, 245, 233, 0.12)',
  },
};

// Custom shadows for a softer look
const shadows = [
  'none',
  '0px 2px 4px rgba(0, 0, 0, 0.05)',
  '0px 4px 8px rgba(0, 0, 0, 0.05)',
  '0px 6px 12px rgba(0, 0, 0, 0.05)',
  '0px 8px 16px rgba(0, 0, 0, 0.05)',
  '0px 10px 20px rgba(0, 0, 0, 0.05)',
  '0px 12px 24px rgba(0, 0, 0, 0.05)',
  '0px 14px 28px rgba(0, 0, 0, 0.05)',
  '0px 16px 32px rgba(0, 0, 0, 0.05)',
  '0px 18px 36px rgba(0, 0, 0, 0.05)',
  '0px 20px 40px rgba(0, 0, 0, 0.05)',
  '0px 22px 44px rgba(0, 0, 0, 0.05)',
  '0px 24px 48px rgba(0, 0, 0, 0.05)',
  '0px 26px 52px rgba(0, 0, 0, 0.05)',
  '0px 28px 56px rgba(0, 0, 0, 0.05)',
  '0px 30px 60px rgba(0, 0, 0, 0.05)',
  '0px 32px 64px rgba(0, 0, 0, 0.05)',
  '0px 34px 68px rgba(0, 0, 0, 0.05)',
  '0px 36px 72px rgba(0, 0, 0, 0.05)',
  '0px 38px 76px rgba(0, 0, 0, 0.05)',
  '0px 40px 80px rgba(0, 0, 0, 0.05)',
  '0px 42px 84px rgba(0, 0, 0, 0.05)',
  '0px 44px 88px rgba(0, 0, 0, 0.05)',
  '0px 46px 92px rgba(0, 0, 0, 0.05)',
  '0px 48px 96px rgba(0, 0, 0, 0.05)',
];

// Create theme function that returns light or dark theme
export const createAppTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      ...colors[mode],
    },
    typography: {
      fontFamily: [
        'Poppins',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: shadows[2],
            },
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: mode === 'light' ? colors.light.primary.dark : colors.dark.primary.light,
            },
          },
          containedSecondary: {
            '&:hover': {
              backgroundColor: mode === 'light' ? colors.light.secondary.dark : colors.dark.secondary.light,
            },
          },
          outlinedPrimary: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
          outlinedSecondary: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: shadows[2],
            backgroundColor: mode === 'light' ? colors.light.background.card : colors.dark.background.card,
            '&:hover': {
              boxShadow: shadows[4],
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
          elevation1: {
            boxShadow: shadows[1],
          },
          elevation2: {
            boxShadow: shadows[2],
          },
          elevation3: {
            boxShadow: shadows[3],
          },
          elevation4: {
            boxShadow: shadows[4],
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 26,
            padding: 0,
            '& .MuiSwitch-switchBase': {
              padding: 1,
              '&.Mui-checked': {
                transform: 'translateX(16px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                  opacity: 1,
                  backgroundColor: mode === 'light' ? colors.light.primary.main : colors.dark.primary.main,
                },
              },
            },
            '& .MuiSwitch-thumb': {
              width: 24,
              height: 24,
            },
            '& .MuiSwitch-track': {
              borderRadius: 13,
              opacity: 1,
              backgroundColor: mode === 'light' ? '#E9E9EA' : '#39393D',
            },
          },
        },
      },
    },
  });
};

// Export both light and dark themes
export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');
