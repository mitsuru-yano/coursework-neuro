import React from 'react'
import ReactDOM from 'react-dom/client'

import { AuthContextProvider } from '@context/AuthContext'
import { UIThemeContextProvider } from './context/UIThemeContext'
import App from './App'

import 'destyle.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
        <AuthContextProvider>
            <UIThemeContextProvider>
                <App />
            </UIThemeContextProvider>
        </AuthContextProvider>
    </React.StrictMode>
)
