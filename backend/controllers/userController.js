
const User = require('../models/User')

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],   
      order: [['name', 'ASC']],
    })
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch users' })
  }
}

module.exports = { getAllUsers }