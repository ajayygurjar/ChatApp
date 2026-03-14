const handlePersonalChat = (socket, io) => {
  socket.on("join_room", (receiverId) => {
    const roomId = [socket.userId, receiverId].sort().join("_");
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room: ${roomId}`);
  });

  socket.on("new_message", ({ receiverId, message }) => {
    const roomId = [socket.userId, receiverId].sort().join("_");
    io.to(roomId).emit("new_message", {
      senderId: socket.userId,
      receiverId,
      message,
      createdAt: new Date(),
    });
  });
};

module.exports = handlePersonalChat;
