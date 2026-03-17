import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import API from '../utils/Api'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
    const { user } = useAuth()

    const [tab, setTab] = useState('personal')
    const [selectedUser, setSelectedUser] = useState(null)
    const [joinedGroups, setJoinedGroups] = useState([])
    const [activeGroup, setActiveGroup] = useState(null)
    const [socket, setSocket] = useState(null)   
    const socketRef = useRef(null)

    useEffect(() => {
        if (!user?.id) return

        const s = io('http://localhost:5000', {
            auth: { token: localStorage.getItem('token') },
        })

        socketRef.current = s
        setSocket(s)

        return () => {
            s.disconnect()
            socketRef.current = null
            setSocket(null)
        }
    }, [user?.id])

    useEffect(() => {
        if (!user?.id) return
        fetchMyGroups()
    }, [user?.id])


    useEffect(() => {
        if (!socket || joinedGroups.length === 0) return
        joinedGroups.forEach(g => socket.emit('join_group', g.name))
    }, [socket])

    const fetchMyGroups = async () => {
        try {
            const { data } = await API.get('/groups/my')
            setJoinedGroups(data)
        } catch (err) {
            console.error('Failed to fetch groups', err)
        }
    }


    const joinGroup = async (groupName) => {
        try {
            const { data } = await API.post('/groups/join', { name: groupName })
            const group = data.group
            setJoinedGroups(prev =>
                prev.find(g => g.id === group.id) ? prev : [...prev, group]
            )
            setActiveGroup(group.name)
            setTab('group')
            return group
        } catch (err) {
            console.error('Failed to join group', err)
        }
    }

    const leaveGroup = async (groupName) => {
        try {
            const group = joinedGroups.find(g => g.name === groupName)
            if (!group) return
            await API.post('/groups/leave', { groupId: group.id })
            setJoinedGroups(prev => prev.filter(g => g.name !== groupName))
            setActiveGroup(null)
        } catch (err) {
            console.error('Failed to leave group', err)
        }
    }

    const selectUser = (u) => { setSelectedUser(u); setTab('personal') }
    const selectGroup = (groupName) => { setActiveGroup(groupName); setTab('group') }

    return (
        <ChatContext.Provider value={{
            socket,
            tab, setTab,
            selectedUser, selectUser,
            joinedGroups, activeGroup,
            joinGroup, leaveGroup, selectGroup,
        }}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChat = () => useContext(ChatContext)