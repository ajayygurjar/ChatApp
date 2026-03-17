const Group = require("../models/Group");
const GroupMember = require("../models/GroupMember");
const User = require("../models/User");

// Join or create group + save membership to DB
const joinGroup = async (req, res) => {
  const { name } = req.body;
  const userId = req.userId;

  try {
    const groupName = name.trim().toLowerCase().replace(/\s+/g, "-");

    // Find or create the group
    const [group, created] = await Group.findOrCreate({
      where: { name: groupName },
      defaults: { createdBy: userId },
    });

    // Add member if not already in group
    await GroupMember.findOrCreate({
      where: { groupId: group.id, userId },
    });

    res.json({ group, created });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to join group", error: err.message });
  }
};

// Leave group — remove membership from DB
const leaveGroup = async (req, res) => {
  const { groupId } = req.body;
  const userId = req.userId;

  try {
    await GroupMember.destroy({ where: { groupId, userId } });
    res.json({ message: "Left group successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to leave group" });
  }
};

// Get all groups the logged-in user has joined
const getMyGroups = async (req, res) => {
  const userId = req.userId;

  try {
    const memberships = await GroupMember.findAll({
      where: { userId },
      include: [{ model: Group }],
    });

    const groups = memberships.map((m) => m.Group);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

// Get all members of a group
const getGroupMembers = async (req, res) => {
  const { groupId } = req.params;

  try {
    const members = await GroupMember.findAll({
      where: { groupId },
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });

    res.json(members.map((m) => m.User));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch members" });
  }
};

module.exports = { joinGroup, leaveGroup, getMyGroups, getGroupMembers };
