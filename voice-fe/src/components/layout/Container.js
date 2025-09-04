import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { Outlet } from 'react-router'

const dynamicStyle = ({ theme, disableGutters }) => css`
    ${disableGutters
        ? `max-width: 100%;
      padding-left: 0;
      padding-right: 0;
      margin-right: 0;
      margin-left: 0;
      `
        : `
    padding-left: 40px;
    padding-right: 40px;

  ${theme.breakpoints.up('sm')} {
    margin-right: auto;
    margin-left: auto;
  }

  ${theme.breakpoints.between('sm', 'md')} {
    max-width: ${theme.breakpoints.values.sm}px;
  }

  ${theme.breakpoints.between('md', 'lg')} {
    max-width: ${theme.breakpoints.values.md}px;
  }

  ${theme.breakpoints.between('lg', 'xl')} {
    max-width: ${theme.breakpoints.values.lg}px;
  }

  ${theme.breakpoints.between('xl', '2xl')} {
    max-width: ${theme.breakpoints.values.xl}px;
  }

  ${theme.breakpoints.up('2xl')} {
    max-width: ${theme.breakpoints.values['2xl']}px;
  }
      `}
`

export const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    ${dynamicStyle}
`

export const ContainerOutlet = () => {
    return (
        <Container>
            <Outlet />
        </Container>
    )
}
