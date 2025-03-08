import Chat from "../../models/chat.model.js";
import { io } from "../../../index.js";
export const createChatOrAddMessage = async (req, res, next) => {
  const { receiverId, message } = req.body;
  const senderId = req.authUser._id;

  // Check if chat already exists
  let chat = await Chat.findOne({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  });

  if (!chat) {
    // Create new chat
    chat = new Chat({ senderId, receiverId, messages: [] });
  }

  chat.messages.push({ message, senderId });
  await chat.save();
  io.to(senderId).emit("newMessage", { message, senderId });
  io.to(receiverId).emit("newMessage", { message, senderId });

  return res.status(201).json({ success: true, chat });
};

// Get Chat History with a Specific User
export const getChatHistory = async (req, res) => {
  const { userId } = req.params;
  const authUserId = req.authUser._id; // Get authenticated user ID

  // Find chat between the authenticated user and the target user
  const chat = await Chat.findOne({
    $or: [
      { senderId: authUserId, receiverId: userId },
      { senderId: userId, receiverId: authUserId },
    ],
  }).populate("messages.senderId", "name email");

  if (!chat) {
    return res.status(404).json({ success: false, message: "Chat not found" });
  }

  res.status(200).json({ success: true, chat });
};
