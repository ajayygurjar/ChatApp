const { uploadToS3 } = require('../middleware/upload')
const Message = require('../models/Message')

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const fileUrl = await uploadToS3(req.file)
    const { receiverId, groupId, type } = req.body
    const io = req.app.get('io')

    const newMessage = await Message.create({
      senderId:   req.userId,
      receiverId: type === 'personal' ? receiverId : null,
      groupId:    type === 'group'    ? groupId    : null,
      message:    null,
      fileUrl,
      fileType:   req.file.mimetype,
      fileName:   req.file.originalname,
      isMedia:    true,
    })

    const msgPayload = newMessage.toJSON()

    if (type === 'group' && groupId) {
      io.to(groupId).emit('group_message', msgPayload)
    } else if (receiverId) {
      io.to(`user_${receiverId}`).emit('newMessage', msgPayload)
    }

    res.json({ fileUrl, message: newMessage })

  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ message: 'Upload failed', error: err.message })
  }
}

module.exports = { uploadMedia }