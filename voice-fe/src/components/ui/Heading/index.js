import styled from '@emotion/styled'
import { css } from '@emotion/react'

export const Heading = styled.h1(
    ({ as: Tag = 'h1', color, weight, align, uppercase, ellipsis, theme }) => {
        let textColor = theme?.palette?.text?.primary || 'inherit'
        if (color && theme?.palette?.[color]) {
            textColor = theme.palette[color]
        } else if (color) {
            textColor = color
        }

        return css`
            ${theme.breakpoints.down('sm')} {
                font-size: 20px;
            }
            ${theme.breakpoints.between('sm', 'lg')} {
                font-size: 30px;
            }
            ${theme.breakpoints.between('lg', 'xxl')} {
                font-size: 40px;
            }
            ${theme.breakpoints.up('xxl')} {
                font-size: 40px;
            }

            color: ${textColor};
            font-weight: ${weight || 600};
            text-align: ${align || 'left'};
            text-transform: ${uppercase ? 'uppercase' : 'none'};
            ${ellipsis &&
            `
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `}
        `
    }
)
