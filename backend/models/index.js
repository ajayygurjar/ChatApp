const Message = require("./Message");
const User = require("./User");
const Group = require("./Group");
const GroupMember = require("./GroupMember");
const ArchivedMessage = require("./ArchivedMessage");

User.hasMany(Message, { foreignKey: "senderId" });
User.hasMany(Message, { foreignKey: "receiverId" });
Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });

Group.hasMany(GroupMember, { foreignKey: "groupId" });
GroupMember.belongsTo(Group, { foreignKey: "groupId" });
User.hasMany(GroupMember, { foreignKey: "userId" });
GroupMember.belongsTo(User, { foreignKey: "userId" });

module.exports = { Message, User, Group, GroupMember,ArchivedMessage };
