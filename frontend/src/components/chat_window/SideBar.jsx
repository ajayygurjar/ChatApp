import { useState, useEffect } from 'react'
import { ListGroup, Form, Button, Container, Spinner } from 'react-bootstrap'
import API from '../../utils/Api'

const SideBar = ({
    currentUser, onLogout,
    onSelectUser, selectedUserId,
    tab, onTabChange,
    joinedGroups, activeGroup, onSelectGroup
}) => {
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
        <div className="d-flex flex-column border-end bg-white" style={{ width: '280px', height: '100vh' }}>

            {/* Header */}
            <Container fluid className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <strong>{currentUser?.name}</strong>
                <Button variant="outline-danger" size="sm" onClick={onLogout}>Logout</Button>
            </Container>

            {/* Tab Switcher */}
            <div className="d-flex border-bottom">
                <button
                    onClick={() => onTabChange('personal')}
                    className="flex-grow-1 py-2 border-0 fw-semibold"
                    style={{
                        background: tab === 'personal' ? '#0d6efd' : '#f8f9fa',
                        color: tab === 'personal' ? 'white' : '#333',
                        fontSize: 13,
                        cursor: 'pointer',
                    }}>
                    💬 Personal
                </button>
                <button
                    onClick={() => onTabChange('group')}
                    className="flex-grow-1 py-2 border-0 fw-semibold"
                    style={{
                        background: tab === 'group' ? '#198754' : '#f8f9fa',
                        color: tab === 'group' ? 'white' : '#333',
                        fontSize: 13,
                        cursor: 'pointer',
                    }}>
                    👥 Group
                </button>
            </div>

            {tab === 'personal' && (
                <>
                    <Container fluid className="p-2 border-bottom">
                        <Form.Control
                            size="sm"
                            placeholder="Search users..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </Container>

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
                </>
            )}

            {tab === 'group' && (
                <ListGroup variant="flush" className="overflow-auto flex-grow-1">
                    {joinedGroups.length === 0 ? (
                        <div className="text-center text-muted mt-4 px-3" style={{ fontSize: 13 }}>
                            No groups yet.<br />
                            <span style={{ fontSize: 12 }}>Use the chat window to join or create one →</span>
                        </div>
                    ) : (
                        joinedGroups.map(gId => (
                            <ListGroup.Item
                                key={gId}
                                action
                                active={gId === activeGroup}
                                className="py-3"
                                onClick={() => onSelectGroup(gId)}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                                        style={{ width: 34, height: 34, flexShrink: 0, fontSize: 16 }}>
                                        #
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{gId}</div>
                                </div>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            )}

        </div>
    )
}

export default SideBar