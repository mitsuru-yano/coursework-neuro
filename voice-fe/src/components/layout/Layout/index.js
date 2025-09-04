import { useAuthContext } from '@context/AuthContext'
import { TTSContextProvider } from '@context/TTSContext'
import styled from '@emotion/styled'
import { Header } from '@layout/Header'
import { Sidebar } from '@layout/Sidebar'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

const LayoutContainer = styled.div`
    background-color: ${({ theme }) => theme.palette.background.primary};
    height: 100vh;
    display: grid;
    grid-template-columns: auto 10fr;
    grid-template-rows: 80px 10fr;
    grid-column-gap: 0px;
    grid-row-gap: 0px;

    & > aside {
        grid-area: 1 / 1 / 3 / 2;
    }

    & > header {
        grid-area: 1 / 2 / 2 / 3;
    }
`

const LayoutContent = styled.main`
    grid-area: 2 / 2 / 3 / 3;
    padding-top: 50px;
    overflow: scroll;

    & > div {
        height: 100%;
    }
`

export const Layout = ({ navLinks }) => {
    const { pathname } = useLocation()
    const { isLogged } = useAuthContext()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLogged) {
            navigate('/login')
        }
    }, [])

    return (
        <TTSContextProvider>
            <LayoutContainer>
                <Sidebar items={navLinks} />
                <Header
                    label={pathname
                        .replace('/', ' ')
                        .trim()
                        .split(' ')
                        .map((el) => `${el[0].toUpperCase()}${el.slice(1)}`)
                        .join('-->')}
                />
                <LayoutContent>
                    <Outlet />
                </LayoutContent>
            </LayoutContainer>
        </TTSContextProvider>
    )
}
