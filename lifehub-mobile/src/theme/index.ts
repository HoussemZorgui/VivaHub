export const colors = {
    // Deep Night Palette
    primary: {
        50: '#f5f3ff',
        100: '#ede9fe',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#8b5cf6',
        600: '#7c3aed', // Pure Violet
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
    },
    accent: {
        cyan: '#06b6d4',
        rose: '#f43f5e',
        amber: '#f59e0b',
        emerald: '#10b981',
    },
    dark: {
        bg: '#050505',
        surface: '#121212',
        card: '#1e1e1e',
        border: '#2a2a2a',
    },
    text: {
        primary: '#FFFFFF',
        secondary: '#A1A1AA',
        muted: '#52525B',
        inverse: '#000000',
    },
    gradients: {
        premium: ['#7c3aed', '#8b5cf6', '#06b6d4'] as [string, string, string],
        darkGlass: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'] as [string, string],
        fire: ['#f43f5e', '#fb7185'] as [string, string],
    }
};

export const shadows = {
    // Advanced 3D Depth
    premium: {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    glass: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    }
};

export const typography = {
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 28,
        huge: 48,
    },
    fontWeight: {
        light: '300' as const,
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '800' as const,
    }
};

export const theme = {
    colors,
    shadows,
    typography,
    spacing: {
        xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
    },
    borderRadius: {
        sm: 8, md: 12, lg: 20, xl: 30, full: 9999
    }
};

export default theme;
