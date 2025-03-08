import Joi from "joi";
import { generalValidations } from "../../middlewares/validation.middleware.js";

export const addCompany = Joi.object({
  companyName: Joi.string().required(),
  description: Joi.string().required(),
  industry: Joi.string().required(),
  address: Joi.string().required(),
  numberOfEmployees: Joi.string().required(),
  companyEmail: Joi.string().email().required(),
  attachment: generalValidations.attachment,
}).required();

export const updateCompanyData = Joi.object({
  id: generalValidations.objectId,
  companyName: Joi.string(),
  description: Joi.string(),
  industry: Joi.string(),
  address: Joi.string(),
  numberOfEmployees: Joi.string(),
  companyEmail: Joi.string().email(),
}).required();

export const softDeleteCompany = Joi.object({
  id: generalValidations.objectId.required(),
}).required();

export const uploadLogo = Joi.object({
  attachment: generalValidations.attachment.required(),
  id: generalValidations.objectId.required(),
}).required();

export const uploadCover = Joi.object({
  attachment: generalValidations.attachment.required(),
  id: generalValidations.objectId.required(),
}).required();

export const deleteCoverPic = Joi.object({
  id: generalValidations.objectId.required(),
}).required();

export const deleteLogo = Joi.object({
  id: generalValidations.objectId.required(),
}).required();

export const getCompanyWithJobs = Joi.object({
  id: generalValidations.objectId.required(),
}).required();

export const addHr = Joi.object({
  id: generalValidations.objectId.required(),
  user: generalValidations.objectId.required(),
}).required();
