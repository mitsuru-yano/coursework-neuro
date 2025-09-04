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

const RangeInputStyled = styled.input`
    width: 100%;
    appearance: none;
    height: 8px;
    border-radius: 4px;
    background: #ccc;
    outline: none;
    transition: background 0.2s ease;

    &::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #4f46e5;
        cursor: pointer;
        border: none;
        transition: background 0.2s ease;
        margin-top: -4px;
    }

    &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #4f46e5;
        cursor: pointer;
        border: none;
    }

    &:hover::-webkit-slider-thumb {
        background: #3730a3;
    }

    &:hover::-moz-range-thumb {
        background: #3730a3;
    }

    &:disabled {
        background: #eee;
        cursor: not-allowed;
    }
`

export const Range = ({ label, min = 0, max = 1, step = 0.1, value, onChange, disabled }) => {
    return (
        <Wrapper>
            {label && <Label>{label}</Label>}
            <RangeInputStyled
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                disabled={disabled}
            />
        </Wrapper>
    )
}
