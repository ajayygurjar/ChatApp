import { useNavigate } from 'react-router-dom'
import { Button, Container } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import SideBar from '../components/chat_window/SideBar'
import ChatWindow from '../components/chat_window/ChatWindow'

const Chat = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
     <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      <SideBar currentUser={user} onLogout={handleLogout} />
      <ChatWindow currentUser={user} />
      </div>
  )
}

export default Chat