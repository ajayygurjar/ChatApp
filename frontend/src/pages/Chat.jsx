
import { Button, Container } from 'react-bootstrap'


const Chat = () => {

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h4>Hello</h4>
      <p className="text-muted">Chat window </p>
      <Button variant="outline-danger" size="sm">
        Logout
      </Button>
    </Container>
  )
}

export default Chat