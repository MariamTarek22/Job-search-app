import Joi from "joi";
import { genders } from "../../constants/genders.js";
import { roles } from "../../constants/roles.js";

export const confirmOtp = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(5).required(),
  type: Joi.string().required(),
}).required();

export const resendOtp = Joi.object({
  email: Joi.string().email().required(),
}).required();

export const signUp = Joi.object({
  firstName: Joi.string().min(2).max(20).required(),
  lastName: Joi.string().min(2).max(20).required(),
  phone: Joi.string().length(11).required(), //or .min(11).max(11)
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  cPassword: Joi.string().valid(Joi.ref("password")).required(),
  gender: Joi.string().valid(...Object.values(genders)),
  DOB: Joi.date(),
  role: Joi.string().valid(...Object.values(roles)),
});

export const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const forgetPassword = Joi.object({
  email: Joi.string().email().required(),
});
export const resetPassword = Joi.object({
  email: Joi.string().email().required(),
  newPassword: Joi.string().required(),
  otp: Joi.string().length(5).required(),
});

export const refreshToken = Joi.object({
  refreshToken: Joi.string().required(),
}).required();

export const googleLogin = Joi.object({
  idToken: Joi.string().required(),
});
