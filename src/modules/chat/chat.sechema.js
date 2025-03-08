import Joi from "joi";
import { generalValidations } from "../../middlewares/validation.middleware.js";

export const createChatOrAddMessage = Joi.object({
  receiverId: generalValidations.objectId.required(),
  message: Joi.string().required(),
}).required();
