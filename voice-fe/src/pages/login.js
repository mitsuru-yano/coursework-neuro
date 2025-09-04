import { useState } from 'react'
import { useAuthContext } from '@context/AuthContext'
import { Button, Input, Heading, Card, Link, CardHeading, CardFooter, CardBody } from '@ui/index'
import { NavLink, useNavigate } from 'react-router'
import { fetchHelper } from '@utils/fetchHelper'

export const Login = () => {
    const { loginHandler } = useAuthContext()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [state, setState] = useState({
        email: '',
        password: '',
    })
    const navigate = useNavigate()

    const onChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        setLoading(true)
        const { data, error } = await fetchHelper('/auth/login', { method: 'POST', body: state })
        setLoading(false)
        if (error) {
            setError(error)
        }
        if (data.token) {
            loginHandler(data.token)
            navigate('/dashboard')
        }
    }
    return (
        <Card>
            <CardHeading>
                <Heading align="center">Login</Heading>
            </CardHeading>
            <CardBody>
                <Input
                    onChange={onChange}
                    value={state?.['email']}
                    name="email"
                    id="email"
                    label="Email"
                    placeholder="Enter email"
                />
                <Input
                    onChange={onChange}
                    value={state?.['password']}
                    name="password"
                    id="password"
                    label="Password"
                    placeholder="Enter password"
                />
            </CardBody>
            <CardFooter>
                <Button loading={loading} onClick={handleSubmit} label="Login" />
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Button label="Back" as={NavLink} to="/" outline size="sm" />
                    <Button label="Register" as={NavLink} to="/register" outline size="sm" />
                </div>
                {message && <span>{message}</span>}
            </CardFooter>
        </Card>
    )
}
