import { useAuthContext } from '@context/AuthContext'
import styled from '@emotion/styled'
import { useState } from 'react'

const InputWrapper = styled.div`
    display: flex;
    position: relative;

    & + & {
        margin-top: 20px;
    }
`

const InputLabel = styled.label`
    color: ${({ theme }) => theme.palette.text.primary};
    position: absolute;
    left: 15px;
    top: ${({ focus }) => (focus ? '0' : '50%')};
    transform: translateY(-50%);
    transition: 0.3s;
    z-index: 1;

    &::before {
        content: '';
        width: calc(100% + 14px);
        height: 1px;
        display: block;
        position: absolute;
        top: calc(50%);
        left: -7px;
        transform: translateY(-50%);
        z-index: -1;
        background-color: ${({ theme, focus }) =>
            focus ? theme.palette.input.background.default : 'transparent'};
    }
`

const InputField = styled.input`
    border-radius: 5px;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 10px;
    padding-bottom: 10px;
    width: 400px;
    outline: none;
    border: 1px solid
        ${({ theme, focus }) =>
            focus ? theme.palette.input.border.focus : theme.palette.input.border.default};
    transition: 0.3s;
    color: ${({ theme }) => theme.palette.text.primary};
    background-color: ${({ theme, focus }) =>
        focus ? theme.palette.input.background.focus : theme.palette.input.background.default};

    &:invalid {
        border: 1px solid ${({ theme }) => theme.palette.input.border.error};
        background-color: ${({ theme }) => theme.palette.input.background.error};
    }

    height: 50px;
`

export const Input = ({ value, id, label, type, onChange, name }) => {
    const [focus, setFocus] = useState(false)

    const focusHandler = () => {
        setFocus(true)
    }
    const blurHandler = () => {
        setFocus(false)
    }

    const { loginHandler } = useAuthContext()

    return (
        <InputWrapper focus={focus || value}>
            <InputLabel focus={focus || value} htmlFor={id}>
                {label}
            </InputLabel>
            <InputField
                focus={focus || value}
                name={name}
                onFocus={focusHandler}
                onBlur={blurHandler}
                id={id}
                type={type}
                value={value}
                onChange={onChange}
            />
        </InputWrapper>
    )
}

export default Input
