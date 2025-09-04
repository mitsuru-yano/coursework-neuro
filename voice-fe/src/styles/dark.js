export const darkTheme = {
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

    // Dark theme shadows
    shadows: {
        xs: '0 1px 2px rgba(255, 255, 255, 0.05)',
        sm: '0 2px 4px rgba(255, 255, 255, 0.08)',
        md: '0 4px 8px rgba(255, 255, 255, 0.12)',
        lg: '0 8px 16px rgba(255, 255, 255, 0.15)',
        xl: '0 12px 24px rgba(255, 255, 255, 0.2)',

        // спец. варианты
        modal: '0 0 20px rgba(255, 255, 255, 0.15)',
        tooltip: '0 0 10px rgba(255, 255, 255, 0.2)',
        glowAccent: '0 0 8px rgba(125, 190, 59, 0.6)', // зелёный подсвет
        glowPrimary: '0 0 12px rgba(100, 149, 237, 0.5)', // синий подсвет
    },

    palette: {
        primary: '#9cd65d',
        accent: '#4da6ff',

        background: {
            primary: '#121212',
            secondary: '#1e1e1e',
            card: '#1c1c1c',
            menu: '#222222',
        },

        text: {
            primary: '#ffffff',
            secondary: '#cccccc',
            placeholder: '#888888',
            inverted: '#000000',
            disabled: '#555555',
        },

        border: {
            light: '#333333',
            dark: '#555555',
        },

        state: {
            hover: '#2a2a2a',
            active: '#333333',
            disabled: '#2d2d2d',
        },

        status: {
            success: '#4caf50',
            warning: '#ff9800',
            error: '#f44336',
            info: '#2196f3',
        },

        button: {
            primary: {
                default: '#9cd65d', // светло-зелёный
                hover: '#7bc13a', // заметно темнее и насыщеннее
                active: '#4e8a1f', // ещё темнее, почти оливковый
                disabled: '#2e2e2e', // более тёмный серый, чтобы явно показать off
                text: '#000000',
            },
            secondary: {
                default: '#4da6ff', // голубой
                hover: '#1a8cff', // яркий синий
                active: '#005bb5', // глубокий насыщенный синий
                disabled: '#2e2e2e',
                text: '#ffffff',
            },
            success: {
                default: '#4caf50', // зелёный
                hover: '#2e7d32', // тёмно-зелёный
                active: '#1b5e20', // почти хвойный
                disabled: '#2e2e2e',
                text: '#ffffff',
            },
            danger: {
                default: '#f44336', // красный
                hover: '#c62828', // тёмно-красный
                active: '#8e0000', // глубокий кровавый
                disabled: '#2e2e2e',
                text: '#ffffff',
            },
        },

        input: {
            border: {
                default: '#555555',
                focus: '#9cd65d',
                error: '#f44336',
                disabled: '#444444',
            },
            background: {
                default: '#1e1e1e',
                focus: '#1e1e1e',
                error: '#2a1a1a',
                disabled: '#2d2d2d',
            },
        },
    },
}
