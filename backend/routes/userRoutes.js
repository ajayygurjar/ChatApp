const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const { getAllUsers } = require('../controllers/userController')

router.get('/', protect, getAllUsers)

module.exports = router