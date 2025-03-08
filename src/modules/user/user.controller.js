import { Router } from "express";
import * as usersServices from "./user.service.js";
import { isAuthanticated } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/index.js";
import {
  cloudUpload,
  fileValidation,
} from "../../utils/fileUploads/multer-cloud.js";
import * as userSchemas from "./user.schema.js";
import { isValid } from "../../middlewares/validation.middleware.js";

const router = Router();

router.put(
  "/update-profile",
  isAuthanticated,
  isValid(userSchemas.updateProfile),
  asyncHandler(usersServices.updateProfile)
);

router.get("/profile", isAuthanticated, asyncHandler(usersServices.getProfile));
router.get(
  "/profile/:id",
  isAuthanticated,
  isValid(userSchemas.getSpecificProfile),
  asyncHandler(usersServices.getSpecificProfile)
);

router.put(
  "/update-password",
  isAuthanticated,
  isValid(userSchemas.updatePassword),
  asyncHandler(usersServices.updatePassword)
);

router.post(
  "/profile-pic",
  isAuthanticated,
  cloudUpload(fileValidation.images).single("image"),
  asyncHandler(usersServices.uploadProfilePic)
);

router.post(
  "/cover-pic",
  isAuthanticated,
  cloudUpload(fileValidation.images).single("image"),
  asyncHandler(usersServices.uploadCoverPic)
);

router.delete(
  "/profile-pic",
  isAuthanticated,
  asyncHandler(usersServices.deleteProfilePic)
);
router.delete(
  "/cover-pic",
  isAuthanticated,
  asyncHandler(usersServices.deleteCoverPic)
);

//freeze account (softDelete)
router.delete(
  "/freeze",
  isAuthanticated,
  asyncHandler(usersServices.freezeAccount)
);


export default router;
