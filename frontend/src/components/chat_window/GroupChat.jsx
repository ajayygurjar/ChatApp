import { useState, useEffect, useRef } from 'react'
import { Container, Form, Button, InputGroup, Spinner } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import API from '../../utils/Api'
import MediaMessage from './MediaMessage'

const GroupChat = () => {
    const { user } = useAuth()
    const { socket, activeGroup, joinGroup, leaveGroup } = useChat()

    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [groupInput, setGroupInput] = useState('')
    const [users, setUsers] = useState({})
    const [uploading, setUploading] = useState(false)
    const bottomRef = useRef(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        API.get('/users').then(({ data }) => {
            const map = {}
            data.forEach(u => { map[u.id] = u.name })
            setUsers(map)
        }).catch(console.error)
    }, [])

    useEffect(() => {
        if (!activeGroup) return
        setMessages([])
        fetchGroupMessages()
    }, [activeGroup])

    const fetchGroupMessages = async () => {
        try {
            const { data } = await API.get(`/messages/group/${activeGroup}`)
            setMessages(data)
        } catch (err) {
            console.error('Failed to fetch group messages', err)
        }
    }

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

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!text.trim() || !activeGroup) return

        const optimistic = {
            groupId: activeGroup,
            senderId: user.id,
            message: text.trim(),
            createdAt: new Date().toISOString(),
        }
        setMessages(prev => [...prev, optimistic])
        setText('')

        try {
            await API.post('/messages/group/send', {
                groupId: activeGroup,
                message: optimistic.message,
            })
        } catch (err) {
            console.error('Failed to save group message', err)
        }
    }


    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file || !activeGroup) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('groupId', activeGroup)
            formData.append('type', 'group')

            const { data } = await API.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            setMessages(prev => [...prev, {
                groupId: activeGroup,
                senderId: user.id,
                fileUrl: data.fileUrl,
                fileType: file.type,
                fileName: file.name,
                isMedia: true,
                createdAt: new Date().toISOString(),
            }])
        } catch (err) {
            console.error('Upload failed:', err)
            alert('Upload failed')
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    if (!activeGroup) {
        return (
            <div className="d-flex flex-column flex-grow-1 align-items-center justify-content-center"
                style={{ height: '100vh', background: '#f0f2f5' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 48 }}></div>
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
                        <div key={msg.id ?? i}
                            className={`d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div className="px-3 py-2 rounded-3 shadow-sm"
                                style={{ maxWidth: '60%', background: isMine ? '#0d6efd' : 'white', color: isMine ? 'white' : 'black' }}>
                                {!isMine && (
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#198754', marginBottom: 2 }}>
                                        {senderName}
                                    </div>
                                )}
                                {msg.isMedia
                                    ? <MediaMessage fileUrl={msg.fileUrl} fileType={msg.fileType} fileName={msg.fileName} />
                                    : <div style={{ fontSize: 14 }}>{msg.message}</div>
                                }
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
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*,video/*,application/pdf"
                    onChange={handleFileUpload}
                />
                <Form onSubmit={sendMessage}>
                    <InputGroup>
                        <Button
                            variant="outline-secondary"
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                            title="Attach file">
                            {uploading ? <Spinner size="sm" /> : '📎'}
                        </Button>
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