const { Server } = require("socket.io");
const socketAuthMiddleware = require("./middleware");
const handleChat = require("./handlers/chat");
const handlePersonalChat = require("./handlers/personalChat");
const handleGroupChat = require('./handlers/groupChat');

const initSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
    },
  });

  // Apply JWT auth middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    handleChat(socket);
    handlePersonalChat(socket, io);
    handleGroupChat(socket, io);
  });

  app.set("io", io);

  return io;
};

module.exports = initSocket;
