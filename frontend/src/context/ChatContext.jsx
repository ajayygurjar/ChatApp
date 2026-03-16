// src/context/ChatContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
    const { user } = useAuth()

    const [tab, setTab] = useState('personal')
    const [selectedUser, setSelectedUser] = useState(null)
    const [joinedGroups, setJoinedGroups] = useState([])
    const [activeGroup, setActiveGroup] = useState(null)
    const socketRef = useRef(null)

    useEffect(() => {
        if (!user?.id) return

        const socket = io('http://localhost:5000', {
            auth: { token: localStorage.getItem('token') },
        })
        socketRef.current = socket

        return () => {
            socket.disconnect()
            socketRef.current = null
        }
    }, [user?.id])

    const joinGroup = (groupId) => {
        setJoinedGroups(prev => prev.includes(groupId) ? prev : [...prev, groupId])
        setActiveGroup(groupId)
        setTab('group')
    }

    const leaveGroup = (groupId) => {
        setJoinedGroups(prev => prev.filter(g => g !== groupId))
        setActiveGroup(null)
    }

    const selectUser = (user) => {
        setSelectedUser(user)
        setTab('personal')
    }

    const selectGroup = (groupId) => {
        setActiveGroup(groupId)
        setTab('group')
    }

    return (
        <ChatContext.Provider value={{
            socket: socketRef.current,
            tab,
            setTab,
            selectedUser,
            selectUser,
            joinedGroups,
            activeGroup,
            joinGroup,
            leaveGroup,
            selectGroup,
        }}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChat = () => useContext(ChatContext)