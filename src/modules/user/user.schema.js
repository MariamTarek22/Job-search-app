import Joi from "joi";
import { genders } from "../../constants/genders.js";
import { generalValidations } from "../../middlewares/validation.middleware.js";

export const updateProfile = Joi.object({
  firstName: Joi.string().min(2).max(20).optional(),
  lastName: Joi.string().min(2).max(20).optional(),
  phone: Joi.string().length(11).optional(),
  gender: Joi.string()
    .valid(...Object.values(genders))
    .optional(),
  DOB: Joi.date().optional(),
});

export const getSpecificProfile = Joi.object({
  id: generalValidations.objectId.required(),
});

export const updatePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
})