
import { useState, useEffect, useRef } from 'react'
import { Container, Form, Button, InputGroup, Badge, Spinner } from 'react-bootstrap'
import API from '../../utils/Api'
import generateRoomId from '../../utils/roomId'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import MediaMessage from './MediaMessage'

const ChatWindow = () => {
  const { user } = useAuth()
  const { socket, selectedUser } = useChat()

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [roomId, setRoomId] = useState(null)
  const [emailInput, setEmailInput] = useState('')
  const [roomError, setRoomError] = useState('')
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const receiverRef = useRef(selectedUser)

  useEffect(() => {
    receiverRef.current = selectedUser
  }, [selectedUser])

  useEffect(() => {
    if (!socket) return

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('connect_error', () => setConnected(false))
    setConnected(socket.connected)

    // ── Handle ALL incoming messages 
    const handleIncoming = (msg) => {
      const currentReceiver = receiverRef.current
      if (!currentReceiver) return


      const isRelevant =
        msg.senderId === currentReceiver.id ||
        msg.receiverId === currentReceiver.id

      if (isRelevant && msg.senderId !== user?.id) {
        setMessages(prev => [...prev, msg])
      }
    }

    socket.on('newMessage', handleIncoming)
    socket.on('new_message', handleIncoming)

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off('newMessage', handleIncoming)
      socket.off('new_message', handleIncoming)
    }
  }, [socket, user?.id])

  useEffect(() => {
    if (!selectedUser?.email || !user?.email || !socket) return
    const rid = generateRoomId(user.email, selectedUser.email)
    setRoomId(rid)
    setRoomError('')
    socket.emit('join_room', rid)
    setMessages([])
    fetchMessages()
  }, [selectedUser?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const { data } = await API.get(`/messages/${selectedUser.id}`)
      setMessages(data)
    } catch (err) {
      console.error('Failed to fetch messages', err)
    }
  }

  const handleJoinByEmail = async (e) => {
    e.preventDefault()
    if (!emailInput.trim()) return
    setRoomError('')
    try {
      const { data: users } = await API.get('/users')
      const target = users.find(u => u.email.toLowerCase() === emailInput.trim().toLowerCase())
      if (!target) { setRoomError('No user found with that email'); return }
      if (target.id === user.id) { setRoomError("You can't chat with yourself"); return }
      const rid = generateRoomId(user.email, target.email)
      setRoomId(rid)
      setEmailInput('')
      socket.emit('join_room', rid)
      const { data: msgs } = await API.get(`/messages/${target.id}`)
      setMessages(msgs)
    } catch {
      setRoomError('Something went wrong')
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() || !selectedUser || !roomId) return
    setSending(true)
    const msgPayload = {
      roomId, receiverId: selectedUser.id,
      message: text.trim(), senderId: user.id,
      createdAt: new Date().toISOString(),
    }
    socket.emit('new_message', msgPayload)
    try {
      await API.post('/messages/send', { receiverId: selectedUser.id, message: text.trim() })
    } catch (err) {
      console.error('Failed to save to DB:', err)
    }
    setMessages(prev => [...prev, msgPayload])
    setText('')
    setSending(false)
  }

  // ── Upload file → S3 via backend
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedUser) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('receiverId', selectedUser.id)
      formData.append('type', 'personal')

      const { data } = await API.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      //  Add sender's media to UI immediately
      setMessages(prev => [...prev, {
        senderId: user.id,
        receiverId: selectedUser.id,
        fileUrl: data.fileUrl,
        fileType: file.type,
        fileName: file.name,
        isMedia: true,
        createdAt: new Date().toISOString(),
      }])

    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed. Check your AWS config.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (!selectedUser) {
    return (
      <div className="d-flex flex-column flex-grow-1 align-items-center justify-content-center"
        style={{ height: '100vh', background: '#f0f2f5' }}>
        <div className="text-muted fs-5 mb-3">Select a user or enter their email to chat</div>
        <Form onSubmit={handleJoinByEmail} style={{ width: 340 }}>
          <InputGroup>
            <Form.Control
              type="email" placeholder="Enter user email..."
              value={emailInput} onChange={e => setEmailInput(e.target.value)}
              isInvalid={!!roomError}
            />
            <Button type="submit" variant="primary">Join Room</Button>
          </InputGroup>
          {roomError && <div className="text-danger mt-1" style={{ fontSize: 13 }}>{roomError}</div>}
        </Form>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column flex-grow-1" style={{ height: '100vh' }}>

      {/* Header */}
      <Container fluid className="p-3 border-bottom bg-white d-flex align-items-center gap-2">
        <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
          style={{ width: 38, height: 38, flexShrink: 0 }}>
          {selectedUser.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-grow-1">
          <div className="fw-semibold">{selectedUser.name}</div>
          <Badge bg={connected ? 'success' : 'secondary'} style={{ fontSize: 10 }}>
            {connected ? 'Connected' : 'Connecting...'}
          </Badge>
        </div>
      </Container>

      {/* Messages */}
      <Container fluid className="flex-grow-1 overflow-auto p-3" style={{ background: '#f0f2f5' }}>
        {messages.length === 0 && (
          <div className="text-center text-muted mt-5">No messages yet. Say hello!</div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.senderId === user?.id
          return (
            <div key={msg.id ?? i}
              className={`d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
              <div className="px-3 py-2 rounded-3 shadow-sm"
                style={{
                  maxWidth: '65%',
                  background: isMine ? '#0d6efd' : 'white',
                  color: isMine ? 'white' : 'black',
                }}>
                {/*  Render media or text */}
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
              {uploading ? <Spinner size="sm" /> : 'Upload'}
            </Button>
            <Form.Control
              placeholder={`Message ${selectedUser.name}...`}
              value={text} onChange={e => setText(e.target.value)}
              autoComplete="off"
            />
            <Button type="submit" variant="primary" disabled={!text.trim() || sending}>
              {sending ? <Spinner size="sm" /> : 'Send'}
            </Button>
          </InputGroup>
        </Form>
      </Container>

    </div>
  )
}

export default ChatWindow