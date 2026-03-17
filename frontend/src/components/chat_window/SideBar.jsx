import { useState, useEffect } from 'react'
import { ListGroup, Form, Button, Container, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import API from '../../utils/Api'

const SideBar = () => {
    const { user, logout } = useAuth()
    const { tab, setTab, selectedUser, selectUser, joinedGroups, activeGroup, selectGroup } = useChat()
    const navigate = useNavigate()

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

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const filtered = users
        .filter(u => u.id !== user?.id)
        .filter(u => u.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="d-flex flex-column border-end bg-white" style={{ width: '280px', height: '100vh' }}>

            {/* Header */}
            <Container fluid className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <strong>{user?.name}</strong>
                <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
            </Container>

            {/* Tab Switcher */}
            <div className="d-flex border-bottom">
                <button onClick={() => setTab('personal')} className="flex-grow-1 py-2 border-0 fw-semibold"
                    style={{ background: tab === 'personal' ? '#0d6efd' : '#f8f9fa', color: tab === 'personal' ? 'white' : '#333', fontSize: 13, cursor: 'pointer' }}>
                    Personal
                </button>
                <button onClick={() => setTab('group')} className="flex-grow-1 py-2 border-0 fw-semibold"
                    style={{ background: tab === 'group' ? '#198754' : '#f8f9fa', color: tab === 'group' ? 'white' : '#333', fontSize: 13, cursor: 'pointer' }}>
                    Group
                </button>
            </div>

            {/* Personal Tab */}
            {tab === 'personal' && (
                <>
                    <Container fluid className="p-2 border-bottom">
                        <Form.Control size="sm" placeholder="Search users..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </Container>
                    <ListGroup variant="flush" className="overflow-auto flex-grow-1">
                        {loading && <div className="text-center mt-4 text-muted"><Spinner size="sm" /> Loading...</div>}
                        {!loading && filtered.length === 0 && (
                            <div className="text-center text-muted mt-4" style={{ fontSize: 13 }}>No users found</div>
                        )}
                        {filtered.map(u => (
                            <ListGroup.Item key={u.id} action active={u.id === selectedUser?.id}
                                className="py-3" onClick={() => selectUser(u)}>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
                                        style={{ width: 34, height: 34, flexShrink: 0, fontSize: 14 }}>
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                                        <div className="text-muted" style={{ fontSize: 12 }}>{u.email}</div>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </>
            )}

            {/* Group Tab — now uses group.name not gId string */}
            {tab === 'group' && (
                <ListGroup variant="flush" className="overflow-auto flex-grow-1">
                    {joinedGroups.length === 0 ? (
                        <div className="text-center text-muted mt-4 px-3" style={{ fontSize: 13 }}>
                            No groups yet.<br />
                            <span style={{ fontSize: 12 }}>Join or create one →</span>
                        </div>
                    ) : (
                        joinedGroups.map(group => (
                            <ListGroup.Item
                                key={group.id}
                                action
                                active={group.name === activeGroup}
                                className="py-3"
                                onClick={() => selectGroup(group.name)}

                            >
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                                        style={{ width: 34, height: 34, flexShrink: 0, fontSize: 16 }}>#</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{group.name}</div>
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