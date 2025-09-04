import styled from '@emotion/styled'
import { Heading } from '@ui/index'
import { SidebarItem } from './SidebarItem'
import { UserAccount } from '@layout/UserAccount'

const SidebarWrapper = styled.aside`
    background-color: ${({ theme }) => theme.palette.background.secondary};
    width: 375px;
    height: 100%;
    display: grid;
    grid-template-rows: 80px 10fr 80px;
    border-right: 1px solid ${({ theme }) => theme.palette.border.light};
`
const SidebarHeading = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 40px;
    border-bottom: 1px solid ${({ theme }) => theme.palette.border.light};
`

const SidebarBody = styled.div`
    padding: 20px 40px;
    overflow: auto;
`
const SidebarBodyContent = styled.ul`
    height: calc(100% + 20px);
    margin-left: -40px;
    margin-right: -40px;
    margin-top: -20px;
`

const SidebarFooter = styled.div`
    border-top: 1px solid ${({ theme }) => theme.palette.border.light};
    padding: 20px 40px;
`

export const Sidebar = ({ items }) => {
    return (
        <SidebarWrapper>
            <SidebarHeading>
                <Heading>SideBar Head</Heading>
            </SidebarHeading>
            <SidebarBody>
                <SidebarBodyContent>
                    {items.map((el) => {
                        return <SidebarItem key={el.url} {...el} />
                    })}
                </SidebarBodyContent>
            </SidebarBody>
            <SidebarFooter>
                <UserAccount />
            </SidebarFooter>
        </SidebarWrapper>
    )
}
