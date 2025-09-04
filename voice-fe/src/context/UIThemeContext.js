import { createContext, useContext, useEffect, useState } from 'react'

const noop = () => {}

const defaultContext = {
    isLogged: null,
    userDetails: null,
    logoutHandler: noop,
    loginHandler: noop,
}

const _UI_THEME_PROVIDER_KEY = 'ui_theme_token'

const UIThemeContext = createContext(defaultContext)

//! TODO - Implement UI logic
/*
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? "dark" : "light";
});
*/

export const UIThemeContextProvider = ({ children }) => {
    const [theme, setTheme] = useState(null)

    const selectThemeHandler = (theme) => {
        setTheme(theme)
        localStorage.setItem(_UI_THEME_PROVIDER_KEY, theme)
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const localTheme = localStorage.getItem(_UI_THEME_PROVIDER_KEY)
            if (localTheme) {
                setTheme(localTheme)
            } else {
                if (
                    window.matchMedia &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches
                ) {
                    setTheme('dark')
                } else {
                    setTheme('light')
                }
            }
        }
    }, [])

    return (
        <UIThemeContext.Provider value={{ theme, setTheme, selectThemeHandler }}>
            {children}
        </UIThemeContext.Provider>
    )
}

export const useUIThemeContext = () => {
    const { theme, setTheme, selectThemeHandler } = useContext(UIThemeContext)
    return { theme, setTheme, selectThemeHandler }
}
