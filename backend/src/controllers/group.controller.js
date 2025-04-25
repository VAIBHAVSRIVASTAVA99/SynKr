import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const admin = req.user._id;

    const newGroup = new Group({
      name,
      description,
      admin,
      members: [...members, admin], 
    });

    await newGroup.save();

    const populatedGroup = await Group.findById(newGroup._id)
      .populate("admin", "name email profilePic")
      .populate("members", "name email profilePic");

    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const groups = await Group.find({
      $or: [{ admin: userId }, { members: userId }],
    })
      .populate("admin", "name email profilePic")
      .populate("members", "name email profilePic");

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const adminId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin.toString() !== adminId.toString()) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    group.members.push(userId);
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "name email profilePic")
      .populate("members", "name email profilePic");

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const adminId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin.toString() !== adminId.toString()) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: "User is not a member" });
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("admin", "name email profilePic")
      .populate("members", "name email profilePic");

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const adminId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin.toString() !== adminId.toString()) {
      return res.status(403).json({ message: "Only admin can delete group" });
    }

    await Group.findByIdAndDelete(groupId);
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 