import { useState, useEffect, useRef } from 'react'
import { Container, Form, Button, InputGroup } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import API from '../../utils/Api'

const GroupChat = () => {
    const { user } = useAuth()
    const { socket, activeGroup, joinGroup, leaveGroup } = useChat()

    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [groupInput, setGroupInput] = useState('')
    const [users, setUsers] = useState({})
    const bottomRef = useRef(null)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await API.get('/users')
                const map = {}
                data.forEach(u => { map[u.id] = u.name })
                setUsers(map)
            } catch (err) {
                console.error('Failed to fetch users', err)
            }
        }
        fetchUsers()
    }, [])

    useEffect(() => {
        if (!socket) return
        const handler = (msg) => {
            if (msg.groupId === activeGroup && msg.senderId !== user?.id) {
                setMessages(prev => [...prev, msg])
            }
        }
        socket.on('group_message', handler)
        return () => socket.off('group_message', handler)
    }, [socket, activeGroup, user?.id])

    useEffect(() => {
        setMessages([])
    }, [activeGroup])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleJoinGroup = (e) => {
        e.preventDefault()
        if (!groupInput.trim() || !socket) return
        const gId = groupInput.trim().toLowerCase().replace(/\s+/g, '-')
        socket.emit('join_group', gId)
        joinGroup(gId)
        setGroupInput('')
    }

    const handleLeaveGroup = () => {
        if (!activeGroup || !socket) return
        socket.emit('leave_group', activeGroup)
        leaveGroup(activeGroup)
    }

    const sendMessage = (e) => {
        e.preventDefault()
        if (!text.trim() || !activeGroup || !socket) return
        const msg = {
            groupId: activeGroup,
            senderId: user.id,
            message: text.trim(),
            createdAt: new Date().toISOString(),
        }
        socket.emit('group_message', { groupId: activeGroup, message: text.trim() })
        setMessages(prev => [...prev, msg])
        setText('')
    }

    if (!activeGroup) {
        return (
            <div className="d-flex flex-column flex-grow-1 align-items-center justify-content-center"
                style={{ height: '100vh', background: '#f0f2f5' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 48 }}>👥</div>
                    <div className="fw-semibold fs-5">Group Chat</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>Create or join a group</div>
                </div>
                <Form onSubmit={handleJoinGroup} style={{ width: 320 }}>
                    <InputGroup>
                        <Form.Control
                            placeholder="Enter group name..."
                            value={groupInput} onChange={e => setGroupInput(e.target.value)}
                        />
                        <Button type="submit" variant="success">Join / Create</Button>
                    </InputGroup>
                    <small className="text-muted d-block mt-1" style={{ fontSize: 12 }}>
                        Share the name with others so they can join
                    </small>
                </Form>
            </div>
        )
    }

    return (
        <div className="d-flex flex-column flex-grow-1" style={{ height: '100vh' }}>

            {/* Header */}
            <Container fluid className="p-3 border-bottom bg-white d-flex align-items-center gap-2">
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: 38, height: 38, flexShrink: 0 }}>#</div>
                <div className="flex-grow-1">
                    <div className="fw-semibold">{activeGroup}</div>
                    <small className="text-muted" style={{ fontSize: 11 }}>Group Chat</small>
                </div>
                <Button variant="outline-danger" size="sm" onClick={handleLeaveGroup}>Leave</Button>
            </Container>

            {/* Messages */}
            <Container fluid className="flex-grow-1 overflow-auto p-3" style={{ background: '#f0f2f5' }}>
                {messages.length === 0 && (
                    <div className="text-center text-muted mt-5">No messages yet. Say hello!</div>
                )}
                {messages.map((msg, i) => {
                    const isMine = msg.senderId === user?.id
                    const senderName = isMine ? user.name : (users[msg.senderId] || 'Unknown')

                    return (
                        <div key={i} className={`d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div className="px-3 py-2 rounded-3 shadow-sm"
                                style={{ maxWidth: '60%', background: isMine ? '#0d6efd' : 'white', color: isMine ? 'white' : 'black' }}>
                                {/* Show name not ID */}
                                {!isMine && (
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#198754', marginBottom: 2 }}>
                                        {senderName}
                                    </div>
                                )}
                                <div style={{ fontSize: 14 }}>{msg.message}</div>
                                <div style={{ fontSize: 11, opacity: 0.7, textAlign: 'right' }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </Container>

            {/* Input */}
            <Container fluid className="p-3 border-top bg-white">
                <Form onSubmit={sendMessage}>
                    <InputGroup>
                        <Form.Control
                            placeholder={`Message #${activeGroup}...`}
                            value={text} onChange={e => setText(e.target.value)}
                            autoComplete="off"
                        />
                        <Button type="submit" variant="primary" disabled={!text.trim()}>Send</Button>
                    </InputGroup>
                </Form>
            </Container>

        </div>
    )
}

export default GroupChat