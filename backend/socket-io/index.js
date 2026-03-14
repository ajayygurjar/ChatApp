const { Server } = require('socket.io')
const socketAuthMiddleware = require('./middleware')
const handleChat = require('./handlers/chat')

const initSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  // Apply JWT auth middleware
  io.use(socketAuthMiddleware)

  io.on('connection', (socket) => handleChat(socket))

  app.set('io', io)

  return io
}

module.exports = initSocket