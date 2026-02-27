// SideBar.jsx
import { ListGroup, Form, Button, Container } from 'react-bootstrap'

const users = []

const SideBar = ({ currentUser, onLogout }) => {
  return (
    <div className="d-flex flex-column border-end" style={{ width: '280px', height: '100vh' }}>

      {/* Header */}
      <Container fluid className="p-3 border-bottom d-flex justify-content-between align-items-center">
        <strong>{currentUser?.name}</strong>
        <Button variant="outline-danger" size="sm" onClick={onLogout}>Logout</Button>
      </Container>

      {/* Search */}
      <Container fluid className="p-2 border-bottom">
        <Form.Control size="sm" placeholder="Search..." />
      </Container>

      {/* User List */}
      <ListGroup variant="flush" className="overflow-auto flex-grow-1">
        {users.map(user => (
          <ListGroup.Item key={user.id} action className="py-3">
            <div className="d-flex justify-content-between">
              <strong style={{ fontSize: 14 }}>{user.name}</strong>
              <small className="text-muted">{user.time}</small>
            </div>
            <small className="text-muted">{user.lastMsg}</small>
          </ListGroup.Item>
        ))}
      </ListGroup>

    </div>
  )
}

export default SideBar