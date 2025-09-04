import styled from '@emotion/styled'
import { Container } from '@layout/Container'
import { Heading } from '@ui/Heading'

const HeaderWrapper = styled.header`
    width: 100%;
    background-color: ${({ theme }) => theme.palette.background.secondary};
    border-bottom: 1px solid ${({ theme }) => theme.palette.border.light};
`
const HeaderContainer = styled(Container)`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 100%;
`
const HeaderContent = styled.div``

export const Header = ({ label }) => {
    return (
        <HeaderWrapper>
            <HeaderContainer>
                <HeaderContent>
                    <Heading>{label}</Heading>
                </HeaderContent>
                <HeaderContent>
                    <div>RightSide dropdown</div>
                </HeaderContent>
            </HeaderContainer>
        </HeaderWrapper>
    )
}
