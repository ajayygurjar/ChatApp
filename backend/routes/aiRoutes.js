const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getSuggestions,
  getSmartReplies,
} = require("../controllers/aiController");

router.post("/suggestions", protect, getSuggestions);
router.post("/smart-replies", protect, getSmartReplies);

module.exports = router;
