export const lightTheme = {
    breakpoints: {
        values: {
            sm: 480,
            md: 768,
            lg: 992,
            xl: 1280,
            xxl: 1692,
        },
        up(key) {
            return `@media (min-width: ${this.values[key]}px)`
        },
        down(key) {
            return `@media (max-width: ${this.values[key] - 0.02}px)`
        },
        between(min, max) {
            return `@media (min-width: ${this.values[min]}px) and (max-width: ${
                this.values[max] - 0.02
            }px)`
        },
    },

    typography: {
        fontFamily: 'Inter',
    },

    // Light theme shadows
    shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.08)',
        sm: '0 2px 4px rgba(0, 0, 0, 0.12)',
        md: '0 4px 8px rgba(0, 0, 0, 0.15)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
        xl: '0 12px 24px rgba(0, 0, 0, 0.25)',

        // спец. варианты
        modal: '0 8px 40px rgba(0, 0, 0, 0.3)',
        tooltip: '0 2px 10px rgba(0, 0, 0, 0.2)',
        glowAccent: '0 0 6px rgba(125, 190, 59, 0.4)', // зелёный подсвет
        glowPrimary: '0 0 12px rgba(100, 149, 237, 0.5)', // синий подсвет
    },

    palette: {
        primary: '#7dbe3b',
        accent: '#0073e6',

        background: {
            primary: '#ffffff',
            secondary: '#f8f8f8',
            card: '#ffffff',
            menu: '#fbfbfa',
        },

        text: {
            primary: '#222222',
            secondary: '#555555',
            placeholder: '#888888',
            inverted: '#ffffff',
            disabled: '#b0b0b0',
        },

        border: {
            light: '#e0e0e0',
            dark: '#c0c0c0',
        },

        state: {
            hover: '#f0f0f0',
            active: '#e6e6e6',
            disabled: '#f5f5f5',
        },

        status: {
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545',
            info: '#17a2b8',
        },

        button: {
            primary: {
                default: '#7dbe3b',
                hover: '#6ba533',
                active: '#5a8d2a',
                disabled: '#dcdcdc',
                text: '#ffffff',
            },
            secondary: {
                default: '#0073e6',
                hover: '#0066cc',
                active: '#005bb5',
                disabled: '#dcdcdc',
                text: '#ffffff',
            },
            success: {
                default: '#28a745',
                hover: '#218838',
                active: '#1e7e34',
                disabled: '#dcdcdc',
                text: '#ffffff',
            },
            danger: {
                default: '#dc3545',
                hover: '#c82333',
                active: '#bd2130',
                disabled: '#dcdcdc',
                text: '#ffffff',
            },
        },

        input: {
            border: {
                default: '#c0c0c0',
                focus: '#7dbe3b',
                error: '#dc3545',
                disabled: '#dcdcdc',
            },
            background: {
                default: '#ffffff',
                focus: '#ffffff',
                error: '#fff5f5',
                disabled: '#f5f5f5',
            },
        },
    },
}
