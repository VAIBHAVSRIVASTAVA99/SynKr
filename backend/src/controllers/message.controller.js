import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filterdUser = await User.find({_id:{$ne:loggedInUserId}}).select("-password");
    res.status(200).json(filterdUser)

   
  } catch (error) {
    console.log("Error in getUser", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages =async (req,res)=>{
try {
const { id:userToChatId }= req.params
const MyId=req.user._id

  const messages =await Message.find({
    $or:[
        {senderId:MyId,receiverId:userToChatId},
        {senderId:userToChatId,receiverId:MyId}
    ]
  }).populate("senderId", "name profilePic");
  res.status(200).json(messages)
} catch (error) {
  console.log("error in getmessages",error.message)
  return res.status(500).json({message:"internal server error"})
}
}

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId) && group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const messages = await Message.find({ groupId })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("error in getGroupMessages", error.message);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, video, groupId } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const sender = await User.findById(senderId).select("fullName profilePic");
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    let imageUrl, videoUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        resource_type: "image",
      });
      imageUrl = uploadResponse.secure_url;
    }

    if (video) {
      const uploadResponse = await cloudinary.uploader.upload(video, {
        resource_type: "video", 
      });
      videoUrl = uploadResponse.secure_url;
    }

    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (!group.members.includes(senderId) && group.admin.toString() !== senderId.toString()) {
        return res.status(403).json({ message: "You are not a member of this group" });
      }

      const newMessage = new Message({
        senderId,
        senderInfo: {
          _id: sender._id,
          fullName: sender.fullName,
          profilePic: sender.profilePic
        },
        groupId,
        groupInfo: {
          _id: group._id,
          name: group.name
        },
        text,
        image: imageUrl,
        video: videoUrl,
      });

      await newMessage.save();
      
      // Emit the message to all group members
      io.to(groupId).emit("newGroupMessage", newMessage);
      
      return res.status(201).json(newMessage);
    }

    const newMessage = new Message({
      senderId,
      senderInfo: {
        _id: sender._id,
        fullName: sender.fullName,
        profilePic: sender.profilePic
      },
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    await newMessage.save();
    
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};