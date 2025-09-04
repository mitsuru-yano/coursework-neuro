import styled from '@emotion/styled'

const getSizeStyles = (size) => {
    switch (size) {
        case 'sm':
            return `
                padding: 8px 16px;
                font-size: 14px;
            `
        case 'md':
            return `
                padding: 12px 24px;
                font-size: 16px;
            `
        default:
            return `
                padding: 15px 29px;
                font-size: 16px;
            `
    }
}

const ButtonWrapper = styled.button`
    position: relative;
    transition: 1s;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    width: 100%;
    cursor: ${({ loading }) => (loading ? 'none' : 'pointer')};
    pointer-events: ${({ loading }) => (loading ? 'none' : 'all')};
    background-color: ${({ theme, loading, outline }) =>
        outline
            ? 'transparent'
            : loading
            ? theme.palette.button.primary.disabled
            : theme.palette.button.primary.default};
    border: ${({ outline, theme }) =>
        outline ? `2px solid ${theme.palette.button.primary.default}` : 'none'};

    &::before {
        content: '';
        display: block;
        background: ${({ theme, outline }) =>
            outline ? 'transparent' : theme.palette.button.primary.default};
        height: 500px;
        width: 500px;
        position: absolute;
        z-index: 0;
        transition: background 1s;
    }

    &:hover {
        background: ${({ theme, outline }) =>
            outline ? 'transparent' : theme.palette.button.primary.hover};
        border-color: ${({ theme, outline }) =>
            outline ? theme.palette.button.primary.hover : 'none'};
    }

    ${({ loading, theme }) =>
        loading
            ? `
        &::before {
            content: '';
            display: block;
            background: linear-gradient(
                90deg,
                ${theme.palette.button.primary.disabled} 0%,
                ${theme.palette.button.primary.default} 50%,
                ${theme.palette.button.primary.default} 100%
            );
            transform: translate(0);
            animation: rotate 3s linear forwards infinite;
            top: 50%;
            transform-origin: top center;
        }
    `
            : ''}
`

const ButtonBackground = styled.div`
    position: relative;
    text-align: center;
    width: 100%;
    transition: 1s;
    background-color: ${({ theme, loading, outline }) =>
        outline
            ? 'transparent'
            : loading
            ? theme.palette.button.primary.disabled
            : theme.palette.button.primary.default};
    border-radius: 5px;
    margin: 5px;
    z-index: 1;
    ${({ size }) => getSizeStyles(size)}
`

const ButtonText = styled.span`
    color: ${({ theme, outline, loading }) =>
        loading
            ? theme.palette.text.primary
            : outline
            ? theme.palette.button.primary.default
            : theme.palette.button.primary.text};
`

export const Button = ({
    label,
    loading,
    onClick,
    outline = false,
    size = 'default',
    ...props
}) => {
    return (
        <ButtonWrapper loading={loading} outline={outline} onClick={onClick} {...props}>
            <ButtonBackground loading={loading} outline={outline} size={size}>
                <ButtonText loading={loading} outline={outline}>
                    {label}
                </ButtonText>
            </ButtonBackground>
        </ButtonWrapper>
    )
}
