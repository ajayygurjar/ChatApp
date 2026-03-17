const { Op } = require("sequelize");
const Message = require("../models/Message");

const sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;

  try {
    const newMessage = await Message.create({
      senderId: req.userId,
      receiverId,
      message,
    });

    const io = req.app.get("io");
    io.to(`user_${receiverId}`).emit("newMessage", newMessage);
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  }
};

const getMessages = async (req, res) => {
  const { receiverId } = req.params;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.userId, receiverId: receiverId },
          { senderId: receiverId, receiverId: req.userId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch messages", error: err.message });
  }
};

const sendGroupMessage = async (req, res) => {
  const { groupId, message } = req.body;

  try {
    const newMessage = await Message.create({
      senderId: req.userId,
      groupId,
      message,
    });

    const io = req.app.get("io");
    io.to(groupId).emit("group_message", {
      ...newMessage.toJSON(),
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to send group message", error: err.message });
  }
};

const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;

  try {
    const messages = await Message.findAll({
      where: { groupId },
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch group messages", error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  sendGroupMessage,
  getGroupMessages,
};
