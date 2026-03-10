const Message = require('./Message')
const User = require('./User')

User.hasMany(Message, { foreignKey: 'senderId' })
User.hasMany(Message, { foreignKey: 'receiverId' })
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' })
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' })

module.exports = { Message, User }  