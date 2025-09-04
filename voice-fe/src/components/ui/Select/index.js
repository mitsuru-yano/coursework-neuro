import styled from '@emotion/styled'

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
    font-family: Inter, sans-serif;
`

const Label = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.palette.text.secondary};
`

const SelectStyled = styled.select`
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.palette.input.border.default};
    font-size: 14px;
    outline: none;
    transition: border 0.5s ease, box-shadow 0.5s ease;
    background-color: ${({ theme }) => theme.palette.input.background.default};
    color: ${({ theme }) => theme.palette.text.primary};

    &:focus {
        border-color: ${({ theme }) => theme.palette.input.border.focus};
        box-shadow: ${({ theme }) => theme.shadows.glowAccent};
    }

    &:disabled {
        background-color: ${({ theme }) => theme.palette.input.border.disabled};
        color: ${({ theme }) => theme.palette.text.disabled};
        cursor: not-allowed;
    }
`

export const Select = ({
    label,
    options,
    optName,
    optKey,
    optValue,
    value,
    onChange,
    disabled,
}) => {
    return (
        <Wrapper>
            {label && <Label>{label}</Label>}
            <SelectStyled value={value || ''} onChange={onChange} disabled={disabled}>
                {options.map((opt) => (
                    <option key={opt[optKey]} value={opt[optValue]}>
                        {opt[optName]}
                    </option>
                ))}
            </SelectStyled>
        </Wrapper>
    )
}
