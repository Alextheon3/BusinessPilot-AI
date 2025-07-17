// Professional Precision Design System for BusinessPilot AI
// Clean Intelligence - CEO-level confidence, not clerk-level chaos

export const theme = {
  // Core Colors - Professional Precision
  colors: {
    primary: {
      50: '#E8F5F5',
      100: '#C4E7E8',
      200: '#9DD8DA',
      300: '#76C9CC',
      400: '#58BDC1',
      500: '#216869', // Aegean Green - Primary
      600: '#1B565A',
      700: '#15434B',
      800: '#0F313C',
      900: '#0A1E2D'
    },
    accent: {
      50: '#FEFBF2',
      100: '#FCF5E0',
      200: '#F9EECA',
      300: '#F6E7B4',
      400: '#F4E0A4',
      500: '#F4D35E', // Cycladic Gold - Accent
      600: '#F0C53A',
      700: '#EBB716',
      800: '#D4A305',
      900: '#B8900A'
    },
    
    // Semantic Colors
    success: {
      50: '#F0FDF4',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D'
    },
    warning: {
      50: '#FFFBEB',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309'
    },
    error: {
      50: '#FEF2F2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C'
    },
    
    // Neutral Colors
    gray: {
      50: '#F8F9FA',
      100: '#F1F3F4',
      200: '#E8EAED',
      300: '#DADCE0',
      400: '#BDC1C6',
      500: '#9AA0A6',
      600: '#5F6368',
      700: '#3C4043',
      800: '#202124',
      900: '#121212'
    },
    
    // Background Colors
    background: {
      light: '#F8F9FA',
      dark: '#121212',
      card: '#FFFFFF',
      cardDark: '#1E1E1E',
      glass: 'rgba(255, 255, 255, 0.1)',
      glassDark: 'rgba(0, 0, 0, 0.1)'
    },
    
    // Government System Colors
    government: {
      ergani: '#1F4E79',    // ΕΡΓΑΝΗ - Blue
      aade: '#0F5132',      // ΑΑΔΕ - Green
      dypa: '#6F42C1',      // ΔΥΠΑ - Purple
      efka: '#D63384',      // ΕΦΚΑ - Pink
      kep: '#FD7E14',       // ΚΕΠ - Orange
      doy: '#20C997'        // ΔΟΥ - Teal
    }
  },

  // Typography - Inter + Noto Sans Greek
  typography: {
    fontFamily: {
      primary: "'Inter', 'Noto Sans Greek', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace"
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem'   // 60px
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },

  // Spacing System
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem'     // 256px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Shadows - Glassmorphism
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    glassDark: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  },

  // Z-Index Scale
  zIndex: {
    auto: 'auto',
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    modal: 1000,
    popover: 1010,
    tooltip: 1020,
    notification: 1030
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Animation/Transition
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Component Variants
  components: {
    // Card Variants
    card: {
      base: 'bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700',
      glass: 'bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-xl border border-white/20 dark:border-black/20',
      elevated: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'
    },
    
    // Button Variants
    button: {
      primary: 'bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors',
      danger: 'bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors'
    },
    
    // Input Variants
    input: {
      base: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
      glass: 'w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-accent-500'
    },
    
    // Badge Variants
    badge: {
      primary: 'bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium',
      success: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
      warning: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
      error: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium'
    }
  },

  // Status Colors for Government Systems
  status: {
    active: '#22C55E',
    pending: '#F59E0B',
    expired: '#EF4444',
    warning: '#F97316',
    info: '#3B82F6'
  },

  // Payment Categories
  payment: {
    tax: '#DC2626',         // Red - Tax payments
    social: '#7C3AED',      // Purple - Social security
    supplier: '#059669',    // Green - Supplier payments
    utility: '#0EA5E9',     // Blue - Utility bills
    salary: '#F59E0B',      // Orange - Salary payments
    other: '#6B7280'        // Gray - Other payments
  }
} as const;

// Type definitions for the theme
export type Theme = typeof theme;

// Helper functions for theme usage
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = theme.colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) break;
  }
  
  return value;
};

export const getSpacing = (key: keyof typeof theme.spacing) => {
  return theme.spacing[key];
};

export const getFontSize = (key: keyof typeof theme.typography.fontSize) => {
  return theme.typography.fontSize[key];
};

// CSS Variables for dynamic theming
export const getCSSVariables = (isDark: boolean) => {
  return {
    '--color-primary': isDark ? theme.colors.primary[400] : theme.colors.primary[500],
    '--color-accent': theme.colors.accent[500],
    '--color-background': isDark ? theme.colors.background.dark : theme.colors.background.light,
    '--color-card': isDark ? theme.colors.background.cardDark : theme.colors.background.card,
    '--color-text': isDark ? theme.colors.gray[100] : theme.colors.gray[900],
    '--color-text-secondary': isDark ? theme.colors.gray[400] : theme.colors.gray[600],
    '--color-border': isDark ? theme.colors.gray[700] : theme.colors.gray[200],
    '--shadow-glass': isDark ? theme.shadows.glassDark : theme.shadows.glass
  };
};

export default theme;