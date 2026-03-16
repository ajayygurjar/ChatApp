import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { io } from 'socket.io-client'
import SideBar from '../components/chat_window/SideBar'
import ChatWindow from '../components/chat_window/ChatWindow'
import GroupChat from '../components/chat_window/GroupChat'

const Chat = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [selectedUser, setSelectedUser] = useState(null)
  const [tab, setTab] = useState('personal')
  const [joinedGroups, setJoinedGroups] = useState([])
  const [activeGroup, setActiveGroup] = useState(null)
  const socketRef = useRef(null)


  useEffect(() => {
    if (!user?.id) return
    const socket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
    })
    socketRef.current = socket
    return () => socket.disconnect()
  }, [user?.id])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleGroupJoined = (groupId) => {
    setJoinedGroups(prev => prev.includes(groupId) ? prev : [...prev, groupId])
    setActiveGroup(groupId)
    setTab('group')
  }

  const handleGroupLeft = (groupId) => {
    setJoinedGroups(prev => prev.filter(g => g !== groupId))
    setActiveGroup(null)
  }

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>

      <SideBar
        currentUser={user}
        onLogout={handleLogout}
        onSelectUser={(u) => { setSelectedUser(u); setTab('personal') }}
        selectedUserId={selectedUser?.id}
        tab={tab}
        onTabChange={setTab}
        joinedGroups={joinedGroups}
        activeGroup={activeGroup}
        onSelectGroup={(gId) => { setActiveGroup(gId); setTab('group') }}
      />

      {tab === 'personal' ? (
        <ChatWindow
          currentUser={user}
          receiver={selectedUser}
        />
      ) : (
        <GroupChat
          currentUser={user}
          socket={socketRef.current}
          activeGroup={activeGroup}
          onGroupJoined={handleGroupJoined}
          onGroupLeft={handleGroupLeft}
        />
      )}

    </div>
  )
}

export default Chat