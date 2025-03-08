import jwt from "jsonwebtoken";
import Chat from "../src/models/chat.model.js";

export const initializeSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error"));

      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid Token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user);

    // Notify all users when a new job application is submitted
    socket.on("newJobApplication", ({ jobId, userId, message }) => {
      console.log(
        `New job application received: Job ${jobId} by User ${userId}`
      );
      io.emit("newJobApplication", { jobId, userId, message }); // Broadcast event
    });

    // Join Chat Room
    socket.on("joinRoom", ({ userId }) => {
      socket.join(userId); // User joins their own ID room
      console.log(`User ${userId} joined their own room`);
    });

    // Send Message (Handles both existing & new chat)
    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
      try {
        let chat = await Chat.findOne({
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        });

        if (!chat) {
          chat = new Chat({ senderId, receiverId, messages: [] });
        }

        const newMessage = { senderId, message };
        chat.messages.push(newMessage);
        await chat.save();

        //  Emit message to specific users
        io.to(senderId).emit("newMessage", newMessage);
        io.to(receiverId).emit("newMessage", newMessage);
      } catch (error) {
        console.error(error);
        socket.emit("errorMessage", { message: "Error sending message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user);
    });
  });
};
