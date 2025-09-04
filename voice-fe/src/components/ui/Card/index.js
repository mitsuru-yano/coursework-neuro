import styled from '@emotion/styled'

export const Card = styled.div`
    padding: 50px 80px;
    background-color: ${({ theme }) => theme.palette.background.card};
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    box-shadow: ${({ theme }) => theme.shadows.lg};
    ${({ fullWidth }) => (fullWidth ? 'width: 100%;' : '')};
`

export const CardHeading = styled.div`
    display: flex;
    justify-content: center;
    & + div {
        margin-top: 40px;
    }
`

export const CardBody = styled.div`
    display: flex;
    flex-direction: column;
    & + div {
        margin-top: 40px;
    }
`

export const CardFooter = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`
