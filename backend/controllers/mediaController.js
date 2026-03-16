const { uploadToS3 } = require("../middleware/upload");

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = await uploadToS3(req.file);

    const { receiverId, groupId, type } = req.body;
    const io = req.app.get("io");

    const msgPayload = {
      senderId: req.userId,
      fileUrl,
      fileType: req.file.mimetype,
      fileName: req.file.originalname,
      isMedia: true,
      createdAt: new Date().toISOString(),
    };

    if (type === "group" && groupId) {
      io.to(groupId).emit("group_message", { ...msgPayload, groupId });
    } else if (receiverId) {
      io.to(`user_${receiverId}`).emit("newMessage", {
        ...msgPayload,
        receiverId,
      });
    }

    res.json({ fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

module.exports = { uploadMedia };
