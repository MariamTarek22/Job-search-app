import { Router } from "express";
import { getChatHistory, createChatOrAddMessage } from "./chat.service.js";
import { isAuthanticated } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/index.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import * as chatSchemas from "./chat.sechema.js";
const router = Router();

// Get chat history
router.get("/:userId", isAuthanticated, asyncHandler(getChatHistory));
router.post(
  "/create-send-chat",
  isAuthanticated,
  isValid(chatSchemas.createChatOrAddMessage),
  asyncHandler(createChatOrAddMessage)
); // Endpoint to create a new chat

export default router;
