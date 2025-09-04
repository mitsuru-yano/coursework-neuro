import { css } from '@emotion/react'

const fontUrl = '/fonts/Inter/'

export const fontInter = css`
    @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 100 900;
        font-display: swap;
        src: local('Inter'), url('${fontUrl}Inter.ttf') format('truetype-variations');
    }

    @font-face {
        font-family: 'Inter';
        font-style: italic;
        font-weight: 100 900;
        font-display: swap;
        src: local('Inter-Italic'), url('${fontUrl}Inter-Italic.ttf') format('truetype-variations');
    }
`
