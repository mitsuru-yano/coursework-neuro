import { Global } from '@emotion/react'
import { ThemeProvider } from '@emotion/react'
import { lightTheme, fontInter, global, rotate, darkTheme } from '@styles/index'

import VoiceRecorder from './VoiceRecorder'
import WakeAndRecord from './WakeAndRecord'

import { useUIThemeContext } from '@context/UIThemeContext'
import Router from './router'

function App() {
    const { theme } = useUIThemeContext()

    return (
        <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
            <Global styles={[global, rotate, fontInter]} />
            <Router />
        </ThemeProvider>
    )
}

export default App
