import { useState } from 'react'
import { fetchHelper } from '@utils/fetchHelper'
import { Button, Input, Heading, Card, CardHeading, CardFooter, CardBody } from '@ui/index'
import { NavLink } from 'react-router'

export const Register = () => {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [state, setState] = useState({
        fname: '',
        lname: '',
        email: '',
        password: '',
        'repeat-pswrd': '',
    })

    const onChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        setLoading(true)
        const { data, error } = await fetchHelper('/auth/register', { method: 'POST', body: state })
        setLoading(false)
        if (error) {
            setError(error)
        }
        if (data) {
            setMessage('Account created, back to login')
        }
    }
    return (
        <Card>
            <CardHeading>
                <Heading align="center">Register</Heading>
            </CardHeading>
            <CardBody>
                <Input
                    onChange={onChange}
                    value={state?.['fname']}
                    name="fname"
                    id="fname"
                    label="First Name"
                />
                <Input
                    onChange={onChange}
                    value={state?.['lname']}
                    name="lname"
                    id="lname"
                    label="Last Name"
                />
                <Input
                    onChange={onChange}
                    value={state?.['email']}
                    name="email"
                    id="email"
                    label="Email"
                />
                <Input
                    onChange={onChange}
                    value={state?.['password']}
                    name="password"
                    id="password"
                    label="Password"
                />
                <Input
                    onChange={onChange}
                    value={state?.['repeat-pswrd']}
                    name="repeat-pswrd"
                    id="repeat-pswrd"
                    label="Repeat password"
                />
            </CardBody>
            <CardFooter>
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    label={loading ? 'Creating' : 'Create an account'}
                />
                <Button as={NavLink} to="/login" label="Login" outline size="sm" />
                {message && <span>{message}</span>}
            </CardFooter>
        </Card>
    )
}
