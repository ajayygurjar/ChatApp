// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
  sendGroupMessage,
  getGroupMessages,
} = require("../controllers/messageController");

router.post("/group/send", protect, sendGroupMessage);
router.get("/group/:groupId", protect, getGroupMessages);

router.post("/send", protect, sendMessage);
router.get("/:receiverId", protect, getMessages);

module.exports = router;
