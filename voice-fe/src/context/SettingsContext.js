import { createContext, useContext } from 'react'

const defaultContext = {}

const SettingsContext = createContext(defaultContext)

export const SettingsContextProvider = ({ children }) => {
    return <SettingsContext.Provider value={{}}>{children}</SettingsContext.Provider>
}

export const useSettingsContext = () => {
    const {} = useContext(SettingsContext)
    return {}
}
