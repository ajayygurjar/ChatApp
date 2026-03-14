
const handleChat = (socket) => {
  console.log(`User ${socket.userId} connected (socket: ${socket.id})`)

  
  socket.join(`user_${socket.userId}`)
  console.log(`User ${socket.userId} joined room user_${socket.userId}`)

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`)
  })
}

module.exports = handleChat