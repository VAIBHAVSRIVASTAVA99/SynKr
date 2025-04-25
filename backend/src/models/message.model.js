import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderInfo: {
      fullName: String,
      profilePic: String,
      _id: mongoose.Schema.Types.ObjectId
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    groupInfo: {
      name: String,
      _id: mongoose.Schema.Types.ObjectId
    },
    text: String,
    image: String,
    video: String
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;