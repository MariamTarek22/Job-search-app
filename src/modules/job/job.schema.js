import Joi from "joi";
import { generalValidations } from "../../middlewares/validation.middleware.js";

export const addJob = Joi.object({
  companyId: generalValidations.objectId.required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  workingTime: Joi.string().required(),
  seniorityLevel: Joi.string().required(),
  technicalSkills: Joi.array().items(Joi.string()).required(),
  softSkills: Joi.array().items(Joi.string()).required(),
}).required();

export const updateJob = Joi.object({
  companyId: generalValidations.objectId.required(),
  jobId: generalValidations.objectId.required(),
  title: Joi.string(),
  description: Joi.string(),
  location: Joi.string(),
  workingTime: Joi.string(),
  seniorityLevel: Joi.string(),
  technicalSkills: Joi.array().items(Joi.string()),
  softSkills: Joi.array().items(Joi.string()),
}).required();

export const getAllJobsWithFilters = Joi.object({
  page: Joi.string(),
  limit: Joi.string(),
  title: Joi.string(),
  location: Joi.string(),
  workingTime: Joi.string(),
  seniorityLevel: Joi.string(),
  technicalSkills: Joi.string(),
}).required();

export const deleteJob = Joi.object({
  companyId: generalValidations.objectId.required(),
  jobId: generalValidations.objectId.required(),
}).required();

export const getJobsForCompany = Joi.object({
  companyId: generalValidations.objectId,
  jobId: generalValidations.objectId,
  page: Joi.string(),
  limit: Joi.string(),
  search: Joi.string(),
}).required();

export const getApplicationsForJob = Joi.object({
  jobId: generalValidations.objectId,
}).required();

export const applyToJob = Joi.object({
  jobId: generalValidations.objectId.required(),
  attachment: generalValidations.attachment,
}).required();

export const changeApplicationStatus = Joi.object({
  jobId: generalValidations.objectId.required(),
  appId: generalValidations.objectId.required(),
  status: Joi.string().required(),
}).required();
