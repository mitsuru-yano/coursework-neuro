import { useAuthContext } from '@context/AuthContext'
import styled from '@emotion/styled'

const UserAccountWrapper = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
`

const UserAccountIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid ${({ theme }) => theme.palette.border.light};
    box-shadow: ${({ theme }) => theme.shadows.glowAccent};
    color: ${({ theme }) => theme.palette.text.primary};
`
const UserAccountUsername = styled.div`
    color: ${({ theme }) => theme.palette.text.primary};
`
const UserAccountActionIcon = styled.button`
    width: 40px;
    height: 40px;
    margin-left: auto;
`

export const UserAccount = () => {
    const { userDetails, logoutHandler } = useAuthContext()
    const { fname, lname } = userDetails
    return (
        <UserAccountWrapper>
            <UserAccountIcon>{fname?.[0] + lname?.[0]}</UserAccountIcon>
            <UserAccountUsername>
                {fname + ' ' + lname || 'Temporary Placeholder'}
            </UserAccountUsername>
            <UserAccountActionIcon onClick={logoutHandler}>
                <img src="https://placehold.co/25x30" />
            </UserAccountActionIcon>
        </UserAccountWrapper>
    )
}
