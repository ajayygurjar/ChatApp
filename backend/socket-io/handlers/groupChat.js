// socket-io/handlers/groupChat.js

const handleGroupChat = (socket, io) => {

  socket.on('join_group', (groupId) => {
    socket.join(groupId)
    console.log(`User ${socket.userId} joined group: ${groupId}`)
  })

  socket.on('group_message', ({ groupId, message }) => {
    io.to(groupId).emit('group_message', {
      groupId,
      senderId: socket.userId,
      message,
      createdAt: new Date().toISOString(),
    })
  })

  socket.on('leave_group', (groupId) => {
    socket.leave(groupId)
    console.log(`User ${socket.userId} left group: ${groupId}`)
  })

}

module.exports = handleGroupChat   