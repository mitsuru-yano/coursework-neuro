import { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const noop = () => {}

const defaultContext = {
    isLogged: null,
    userDetails: null,
    token: null,
    logoutHandler: noop,
    loginHandler: noop,
}

const _AUTH_PROVIDER_KEY = 'user_token'

const AuthContext = createContext(defaultContext)

export const AuthContextProvider = ({ children }) => {
    const [isLogged, setIsLogged] = useState(null)
    const [userDetails, setUserDetails] = useState({})
    const [token, setToken] = useState(null)

    const logoutHandler = () => {
        setIsLogged(false)
        setUserDetails({})
        setToken(null)
        localStorage.removeItem(_AUTH_PROVIDER_KEY)
    }

    const loginHandler = (token) => {
        try {
            const decoded = jwtDecode(token) // декодируем payload
            setIsLogged(true)
            setUserDetails(decoded)
            setToken(token)
            localStorage.setItem(_AUTH_PROVIDER_KEY, token)
        } catch (e) {
            console.error('Invalid token', e)
            logoutHandler()
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedToken = localStorage.getItem(_AUTH_PROVIDER_KEY)

            if (savedToken) {
                try {
                    const decoded = jwtDecode(savedToken)
                    setIsLogged(true)
                    setUserDetails(decoded)
                    setToken(savedToken)
                } catch {
                    logoutHandler()
                }
            } else {
                setIsLogged(false)
            }
        }
    }, [])

    return (
        <AuthContext.Provider value={{ isLogged, userDetails, token, logoutHandler, loginHandler }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => {
    const { isLogged, userDetails, token, logoutHandler, loginHandler } = useContext(AuthContext)
    return { isLogged, userDetails, token, logoutHandler, loginHandler }
}
