const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')    
const User = require('./User')               

const Message = sequelize.define('Message', {  
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  message: { type: DataTypes.TEXT, allowNull: false },
})

module.exports = Message