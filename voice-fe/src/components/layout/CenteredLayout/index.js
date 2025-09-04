import styled from '@emotion/styled'
import { Outlet, useNavigate } from 'react-router'
import { Container } from '@layout/Container'
import { useAuthContext } from '@context/AuthContext'
import { useEffect } from 'react'

const CenteredContainer = styled(Container)`
    height: 100vh;
    justify-content: center;
    background-color: ${({ theme }) => theme.palette.background.primary};
`

export const CenteredLayout = () => {
    const { isLogged } = useAuthContext()
    const navigate = useNavigate()
    useEffect(() => {
        if (isLogged) {
            navigate('/dashboard')
        }
    }, [isLogged])
    return (
        <CenteredContainer>
            <Outlet />
        </CenteredContainer>
    )
}
