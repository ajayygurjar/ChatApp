const cron = require("node-cron");
const { Op } = require("sequelize");
const Message = require("../models/Message");
const ArchivedMessage = require("../models/ArchivedMessage");

const archiveOldMessages = async () => {
  try {
    console.log("Archive job started...");

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    //Find all messages older than 1 day
    const oldMessages = await Message.findAll({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
    });

    if (oldMessages.length === 0) {
      console.log("No messages to archive");
      return;
    }

    //Copy to ArchivedMessage table
    const toArchive = oldMessages.map((msg) => ({
      originalId: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      groupId: msg.groupId,
      message: msg.message,
      fileUrl: msg.fileUrl,
      fileType: msg.fileType,
      fileName: msg.fileName,
      isMedia: msg.isMedia,
      originalCreatedAt: msg.createdAt,
    }));

    await ArchivedMessage.bulkCreate(toArchive);
    console.log(`Archived ${oldMessages.length} messages`);

    //Delete from Messages table
    await Message.destroy({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
    });

    console.log(
      `Deleted ${oldMessages.length} old messages from Messages table`,
    );
    console.log("Archive job completed successfully");
  } catch (err) {
    console.error("Archive job failed:", err.message);
  }
};

// Runs every day at midnight (00:00)
const startArchiveJob = () => {
  cron.schedule("0 0 * * *", archiveOldMessages);
  console.log("Archive cron job scheduled — runs daily at midnight");
};

module.exports = { startArchiveJob, archiveOldMessages };
