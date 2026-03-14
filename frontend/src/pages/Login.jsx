import { useState } from 'react'
import { Link, useNavigate,Navigate } from 'react-router-dom'
import { Form, Button, Card, Alert, Container } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import API from '../utils/Api'

const Login = () => {
  const navigate = useNavigate()
  const { login,user } = useAuth()

  if (user) return <Navigate to="/chat" />

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await API.post('/auth/login', { email, password })
      login(data.user, data.token)
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: '400px' }} className="p-4 shadow-sm">

        <h4 className="mb-1 fw-bold">Welcome back</h4>
        <p className="text-muted mb-4">Sign in to your account</p>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

        </Form>

        <p className="text-center mt-3 mb-0 text-muted" style={{ fontSize: '14px' }}>
          No account? <Link to="/signup">Sign up</Link>
        </p>

      </Card>
    </Container>
  )
}

export default Login