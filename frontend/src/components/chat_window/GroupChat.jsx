import { useState, useEffect, useRef } from 'react'
import { Container, Form, Button, InputGroup } from 'react-bootstrap'

const GroupChat = ({ currentUser, socket, activeGroup, onGroupJoined, onGroupLeft }) => {
    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [groupInput, setGroupInput] = useState('')
    const bottomRef = useRef(null)

    useEffect(() => {
        if (!socket) return

        const handler = (msg) => {
            if (msg.groupId === activeGroup) {
                if (msg.senderId !== currentUser?.id) {
                    setMessages(prev => [...prev, msg])
                }
            }
        }

        socket.on('group_message', handler)
        return () => socket.off('group_message', handler)
    }, [socket, activeGroup, currentUser?.id])


    useEffect(() => {
        setMessages([])
    }, [activeGroup])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const joinGroup = (e) => {
        e.preventDefault()
        if (!groupInput.trim() || !socket) return
        const gId = groupInput.trim().toLowerCase().replace(/\s+/g, '-')
        socket.emit('join_group', gId)
        onGroupJoined(gId)
        setGroupInput('')
    }

    const leaveGroup = () => {
        if (!activeGroup || !socket) return
        socket.emit('leave_group', activeGroup)
        onGroupLeft(activeGroup)
    }

    const sendMessage = (e) => {
        e.preventDefault()
        if (!text.trim() || !activeGroup || !socket) return

        const msg = {
            groupId: activeGroup,
            senderId: currentUser.id,
            message: text.trim(),
            createdAt: new Date().toISOString(),
        }

        socket.emit('group_message', { groupId: activeGroup, message: text.trim() })
        setMessages(prev => [...prev, msg])
        setText('')
    }

    if (!activeGroup) {
        return (
            <div
                className="d-flex flex-column flex-grow-1 align-items-center justify-content-center"
                style={{ height: '100vh', background: '#f0f2f5' }}>

                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 48 }}>👥</div>
                    <div className="fw-semibold fs-5">Group Chat</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                        Create a group or join an existing one
                    </div>
                </div>

                <Form onSubmit={joinGroup} style={{ width: 320 }}>
                    <InputGroup>
                        <Form.Control
                            placeholder="Enter group name..."
                            value={groupInput}
                            onChange={e => setGroupInput(e.target.value)}
                        />
                        <Button type="submit" variant="success">
                            Join / Create
                        </Button>
                    </InputGroup>
                    <small className="text-muted d-block mt-1" style={{ fontSize: 12 }}>
                        Share the group name with others to chat together
                    </small>
                </Form>
            </div>
        )
    }

    return (
        <div className="d-flex flex-column flex-grow-1" style={{ height: '100vh' }}>

            {/* Header */}
            <Container fluid
                className="p-3 border-bottom bg-white d-flex align-items-center gap-2">
                <div
                    className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: 38, height: 38, flexShrink: 0 }}>
                    #
                </div>
                <div className="flex-grow-1">
                    <div className="fw-semibold">{activeGroup}</div>
                    <small className="text-muted" style={{ fontSize: 11 }}>Group Chat</small>
                </div>
                <Button variant="outline-danger" size="sm" onClick={leaveGroup}>
                    Leave
                </Button>
            </Container>

            {/* Messages */}
            <Container fluid
                className="flex-grow-1 overflow-auto p-3"
                style={{ background: '#f0f2f5' }}>
                {messages.length === 0 && (
                    <div className="text-center text-muted mt-5">
                        No messages yet. Say hello!
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isMine = msg.senderId === currentUser?.id
                    return (
                        <div
                            key={i}
                            className={`d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div
                                className="px-3 py-2 rounded-3 shadow-sm"
                                style={{
                                    maxWidth: '60%',
                                    background: isMine ? '#0d6efd' : 'white',
                                    color: isMine ? 'white' : 'black',
                                }}>
                                {!isMine && (
                                    <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, marginBottom: 2 }}>
                                        User {msg.senderId}
                                    </div>
                                )}
                                <div style={{ fontSize: 14 }}>{msg.message}</div>
                                <div style={{ fontSize: 11, opacity: 0.7, textAlign: 'right' }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit', minute: '2-digit'
                                    })}
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
                            value={text}
                            onChange={e => setText(e.target.value)}
                            autoComplete="off"
                        />
                        <Button type="submit" variant="primary" disabled={!text.trim()}>
                            Send
                        </Button>
                    </InputGroup>
                </Form>
            </Container>

        </div>
    )
}

export default GroupChat