import { useNavigate } from 'react-router-dom'
import { Button, Container } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'

const Chat = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h4>Hello, {user?.name}</h4>
      <p className="text-muted">Chat window</p>
      <Button variant="outline-danger" size="sm" onClick={handleLogout}>
        Logout
      </Button>
    </Container>
  )
}

export default Chat