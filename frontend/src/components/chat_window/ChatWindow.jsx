// ChatWindow.jsx
import { useState, useEffect, useRef } from 'react'
import { Container, Form, Button, InputGroup, Badge } from 'react-bootstrap'

const ChatWindow = ({ currentUser }) => {

  const [messages, setMessages] = useState([])

  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: text.trim(),
      senderId: 1,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
    setText('')
  }

  return (
    <div className="d-flex flex-column flex-grow-1" style={{ height: '100vh' }}>

      {/* Chat Header */}
      <Container fluid className="p-3 border-bottom bg-white d-flex align-items-center gap-2">
        <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
          style={{ width: 38, height: 38, flexShrink: 0 }}>
          A
        </div>
        <div>
          <div className="fw-semibold">Aman (Dummy)</div>
          <Badge bg="success" style={{ fontSize: 10 }}>Online (Dummy)</Badge>
        </div>
      </Container>

      {/* Messages Area */}
      <Container fluid className="flex-grow-1 overflow-auto p-3" style={{ background: '#f0f2f5' }}>
        {messages.map(msg => {
          const isMine = msg.senderId === 1
          return (
            <div key={msg.id} className={`d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
              <div className="px-3 py-2 rounded-3 shadow-sm"
                style={{
                  maxWidth: '60%',
                  background: isMine ? '#0d6efd' : 'white',
                  color: isMine ? 'white' : 'black',
                }}>
                <div style={{ fontSize: 14 }}>{msg.text}</div>
                <div style={{ fontSize: 11, opacity: 0.7, textAlign: 'right' }}>{msg.time}</div>
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
              placeholder="Type a message..."
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

export default ChatWindow