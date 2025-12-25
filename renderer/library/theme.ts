export const THEME = {
    colors: {
        // Backgrounds
        obsidian: '#0a0a0b', // Deepest black-blue
        charcoal: '#171717', // Panel background
        glass: 'rgba(23, 23, 23, 0.8)', // Glass panel base

        // Accents (Neon/FinTech)
        emerald: '#10b981', // Positive/Up
        rose: '#f43f5e',    // Negative/Down
        blue: '#3b82f6',    // Neutral/Info
        gold: '#f59e0b',    // Warning/Highlight
        purple: '#8b5cf6',  // Secondary Accent

        // Text
        white: '#ffffff',
        gray: {
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827'
        },

        // UI
        border: 'rgba(255, 255, 255, 0.08)',
        glow: {
            green: '0 0 12px rgba(16, 185, 129, 0.4)',
            red: '0 0 12px rgba(244, 63, 94, 0.4)',
            blue: '0 0 12px rgba(59, 130, 246, 0.4)'
        }
    },

    typography: {
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        header: {
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '-0.02em'
        },
        subHeader: {
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '-0.01em'
        },
        body: {
            fontSize: 16,
            fontWeight: 400
        },
        mono: {
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 14
        }
    },

    layout: {
        borderRadius: 16,
        padding: 24,
        gap: 16
    }
};

// Helper for common styles
export const STYLES = {
    glassPanel: {
        background: `linear-gradient(180deg, ${THEME.colors.glass} 0%, rgba(10, 10, 10, 0.95) 100%)`,
        borderRadius: THEME.layout.borderRadius,
        border: `1px solid ${THEME.colors.border}`,
        boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
    },
    absoluteCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
    }
};
