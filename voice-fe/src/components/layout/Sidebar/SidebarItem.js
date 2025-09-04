import styled from '@emotion/styled'
import { Link } from '@ui/Link'
import { NavLink } from 'react-router'

const SidebarItemWrapper = styled.li``

const SidebarItemLink = styled(Link)`
    padding: 20px;
    display: block;
    width: 100%;
    font-size: 18px;
    background-color: transparent;
    box-shadow: none;
    transition: 0.5s;

    &.active {
        background-color: ${({ theme }) => theme.palette.background.menu};
        box-shadow: ${({ theme }) => theme.shadows.glowAccent}, ${({ theme }) => theme.shadows.xs};
    }
`

export const SidebarItem = ({ label, url, icon }) => {
    return (
        <SidebarItemWrapper>
            <SidebarItemLink as={NavLink} to={`/${url}`}>
                {label}
            </SidebarItemLink>
        </SidebarItemWrapper>
    )
}
