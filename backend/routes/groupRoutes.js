const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  joinGroup,
  leaveGroup,
  getMyGroups,
  getGroupMembers,
} = require("../controllers/groupController");

router.post("/join", protect, joinGroup); 
router.post("/leave", protect, leaveGroup);
router.get("/my", protect, getMyGroups); 
router.get("/:groupId/members", protect, getGroupMembers); 

module.exports = router;
