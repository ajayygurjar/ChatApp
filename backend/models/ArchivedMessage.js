const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ArchivedMessage = sequelize.define("ArchivedMessage", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  originalId: { type: DataTypes.INTEGER },
  senderId: { type: DataTypes.INTEGER, allowNull: false },
  receiverId: { type: DataTypes.INTEGER, allowNull: true },
  groupId: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: true },
  fileUrl: { type: DataTypes.STRING(500), allowNull: true },
  fileType: { type: DataTypes.STRING, allowNull: true },
  fileName: { type: DataTypes.STRING, allowNull: true },
  isMedia: { type: DataTypes.BOOLEAN, defaultValue: false },
  originalCreatedAt: { type: DataTypes.DATE },
  archivedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = ArchivedMessage;
