import { useState, useEffect, useRef } from 'react'
import { Container, Form, Button, InputGroup, Badge, Spinner } from 'react-bootstrap'
import { io } from 'socket.io-client'
import API from '../../utils/Api'

const ChatWindow = ({ currentUser, receiver }) => {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!currentUser?.id) return

    const socket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setConnected(true)
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('connect_error', (err) => {
      console.error('Socket auth error:', err.message)
      setConnected(false)
    })

    socket.on('newMessage', (msg) => {
      setMessages(prev => {
        const currentReceiverId = receiverRef.current?.id
        if (
          currentReceiverId &&
          (msg.senderId === currentReceiverId || msg.receiverId === currentReceiverId)
        ) {
          return [...prev, msg]
        }
        return prev
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [currentUser?.id])

  const receiverRef = useRef(receiver)
  useEffect(() => {
    receiverRef.current = receiver
  }, [receiver])

  useEffect(() => {
    if (!receiver) return
    setMessages([])
    fetchMessages()
  }, [receiver?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const { data } = await API.get(`/messages/${receiver.id}`)
      setMessages(data)
    } catch (err) {
      console.error('Failed to fetch messages', err)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() || !receiver) return
    setSending(true)
    try {
      const { data } = await API.post('/messages/send', {
        receiverId: receiver.id,
        message: text.trim(),
      })
      setMessages(prev => [...prev, data])
      setText('')
    } catch (err) {
      console.error('Failed to send message', err)
    } finally {
      setSending(false)
    }
  }

  if (!receiver) {
    return (
      <div className="d-flex flex-column flex-grow-1 align-items-center justify-content-center"
        style={{ height: '100vh', background: '#f0f2f5' }}>
        <div className="text-muted fs-5">Select a user to start chatting</div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column flex-grow-1" style={{ height: '100vh' }}>

      {/* Chat Header */}
      <Container fluid className="p-3 border-bottom bg-white d-flex align-items-center gap-2">
        <div
          className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
          style={{ width: 38, height: 38, flexShrink: 0 }}>
          {receiver.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="fw-semibold">{receiver.name}</div>
          <Badge bg={connected ? 'success' : 'secondary'} style={{ fontSize: 10 }}>
            {connected ? 'Connected' : 'Connecting...'}
          </Badge>
        </div>
      </Container>

      {/* Messages Area */}
      <Container fluid className="flex-grow-1 overflow-auto p-3" style={{ background: '#f0f2f5' }}>
        {messages.length === 0 && (
          <div className="text-center text-muted mt-5">No messages yet. Say hello!</div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.senderId === currentUser?.id
          return (
            <div key={msg.id ?? i}
              className={`d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
              <div className="px-3 py-2 rounded-3 shadow-sm"
                style={{
                  maxWidth: '60%',
                  background: isMine ? '#0d6efd' : 'white',
                  color: isMine ? 'white' : 'black',
                }}>
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

      {/* Input Box */}
      <Container fluid className="p-3 border-top bg-white">
        <Form onSubmit={sendMessage}>
          <InputGroup>
            <Form.Control
              placeholder={`Message ${receiver.name}...`}
              value={text}
              onChange={e => setText(e.target.value)}
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