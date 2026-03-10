import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SideBar from '../components/chat_window/SideBar'
import ChatWindow from '../components/chat_window/ChatWindow'

const Chat = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [selectedUser, setSelectedUser] = useState(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      <SideBar
        currentUser={user}
        onLogout={handleLogout}
        onSelectUser={setSelectedUser}
        selectedUserId={selectedUser?.id}
      />
      <ChatWindow
        currentUser={user}
        receiver={selectedUser}
      />
    </div>
  )
}

export default Chat