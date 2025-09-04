import styled from '@emotion/styled'

export const Link = styled.a`
    ${({ theme, color, underline, weight, size, align, margin, display, padding }) => {
        let baseColor = theme?.palette?.button.primary.default || '#0073e6'

        if (color && theme?.palette?.[color]) {
            baseColor = theme.palette[color]
        } else if (color) {
            baseColor = color
        }

        return `
      color: ${baseColor};
      text-decoration: ${!underline ? 'none' : 'underline'};
      font-weight: ${weight || 500};
      font-size: ${size || '1rem'};
      display: ${display || 'block'};
      margin: ${margin || 0};
      text-align: ${align || 'left'};
      padding: ${padding || 0};
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: ${theme?.palette?.button.primary.hover || '#005bb5'};
      }

      &:active, &.active {
        color: ${theme?.palette?.button.primary.active || '#003f7f'};
      }
    `
    }}
`
