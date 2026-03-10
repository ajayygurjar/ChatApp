import { useState, useEffect } from 'react'
import { ListGroup, Form, Button, Container, Spinner } from 'react-bootstrap'
import API from '../../utils/Api'

const SideBar = ({ currentUser, onLogout, onSelectUser, selectedUserId }) => {
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const { data } = await API.get('/users')
            setUsers(data)
        } catch (err) {
            console.error('Failed to load users', err)
        } finally {
            setLoading(false)
        }
    }

    const filtered = users
        .filter(u => u.id !== currentUser?.id)
        .filter(u => u.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="d-flex flex-column border-end" style={{ width: '280px', height: '100vh' }}>

            {/* Header */}
            <Container fluid className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <strong>{currentUser?.name}</strong>
                <Button variant="outline-danger" size="sm" onClick={onLogout}>Logout</Button>
            </Container>

            {/* Search */}
            <Container fluid className="p-2 border-bottom">
                <Form.Control
                    size="sm"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </Container>

            {/* User List */}
            <ListGroup variant="flush" className="overflow-auto flex-grow-1">
                {loading && (
                    <div className="text-center mt-4 text-muted">
                        <Spinner size="sm" /> Loading...
                    </div>
                )}
                {!loading && filtered.length === 0 && (
                    <div className="text-center text-muted mt-4" style={{ fontSize: 13 }}>
                        No users found
                    </div>
                )}
                {filtered.map(user => (
                    <ListGroup.Item
                        key={user.id}
                        action
                        active={user.id === selectedUserId}
                        className="py-3"
                        onClick={() => onSelectUser(user)}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <div
                                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
                                style={{ width: 34, height: 34, flexShrink: 0, fontSize: 14 }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
                                <div className="text-muted" style={{ fontSize: 12 }}>{user.email}</div>
                            </div>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>

        </div>
    )
}

export default SideBar