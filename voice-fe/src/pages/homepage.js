import { Button } from '@ui/Button'
import { Card, CardBody, CardHeading } from '@ui/Card'
import { Heading } from '@ui/Heading'
import { NavLink } from 'react-router'

export const Homepage = () => {
    return (
        <>
            <Card>
                <CardHeading>
                    <Heading>Is it demo of voice control</Heading>
                </CardHeading>
                <CardBody>
                    <Button as={NavLink} to="/dashboard" label="View Dashboard" />
                </CardBody>
            </Card>
        </>
    )
}
