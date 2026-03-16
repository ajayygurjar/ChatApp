import { ChatProvider, useChat } from '../context/ChatContext'
import SideBar from '../components/chat_window/SideBar'
import ChatWindow from '../components/chat_window/ChatWindow'
import GroupChat from '../components/chat_window/GroupChat'

const ChatLayout = () => {
  const { tab } = useChat()

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      <SideBar />
      {tab === 'personal' ? <ChatWindow /> : <GroupChat />}
    </div>
  )
}

const Chat = () => {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  )
}

export default Chat