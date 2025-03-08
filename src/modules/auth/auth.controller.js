import { Router } from "express";
import * as authService from "./auth.service.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import * as authSchemas from "./auth.schema.js";
const router = Router();
router.post(
  "/sign-up",
  asyncHandler(isValid(authSchemas.signUp)),
  asyncHandler(authService.signUp)
);

router.post(
  "/confirm-otp",
  isValid(authSchemas.confirmOtp),
  asyncHandler(authService.confirmOtp)
);
router.post(
  "/resend-otp",
  isValid(authSchemas.resendOtp),
  asyncHandler(authService.resendOtp)
);

router.post(
  "/login",
  asyncHandler(isValid(authSchemas.login)),
  asyncHandler(authService.login)
);
//create new accesss token after the old one expired if the refresh token is still valid
router.post(
  "/refresh-token",
  isValid(authSchemas.refreshToken),
  asyncHandler(authService.refreshToken)
);

router.post(
  "/google-login",
  isValid(authSchemas.googleLogin),
  asyncHandler(authService.googleLogin)
);
router.post(
  "/forget-password",
  isValid(authSchemas.forgetPassword),
  asyncHandler(authService.forgetPassword)
);
router.post(
  "/reset-password",
  isValid(authSchemas.resetPassword),
  asyncHandler(authService.resetPassword)
);

export default router;
