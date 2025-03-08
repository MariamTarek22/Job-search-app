import { model, Schema, Types } from "mongoose";

const chatSchema = new Schema(
  {
    senderId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        message: String,
        senderId: Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Chat = model("Chat", chatSchema);

export default Chat;
