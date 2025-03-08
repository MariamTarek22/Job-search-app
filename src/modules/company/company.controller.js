import { Router } from "express";
import * as companyService from "./company.service.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import * as companySchemas from "./company.schema.js";
import { isAuthanticated } from "../../middlewares/auth.middleware.js";
import jobRouter from "../job/job.controller.js"; // ✅ Import as default
import {
  cloudUpload,
  fileValidation,
} from "../../utils/fileUploads/multer-cloud.js";
const router = Router();

router.use("/:companyId/job", jobRouter);

router.post(
  "/",
  isAuthanticated,
  cloudUpload([...fileValidation.files, ...fileValidation.images]).single(
    "attachment"
  ),
  isValid(companySchemas.addCompany),
  asyncHandler(companyService.addCompany)
);

router.patch(
  "/update/:id",
  isAuthanticated,
  isValid(companySchemas.updateCompanyData),
  asyncHandler(companyService.updateCompanyData)
);

router.delete(
  "/:id",
  isAuthanticated,
  isValid(companySchemas.softDeleteCompany),
  asyncHandler(companyService.softDeleteCompany)
);

router.get(
  "/search",
  isAuthanticated,
  asyncHandler(companyService.searchCompany)
);

router.patch(
  "/upload-logo/:id",
  isAuthanticated,
  cloudUpload(fileValidation.images).single("attachment"),
  isValid(companySchemas.uploadLogo),
  asyncHandler(companyService.uploadLogo)
);

router.patch(
  "/upload-cover/:id",
  isAuthanticated,
  cloudUpload(fileValidation.images).single("attachment"),
  isValid(companySchemas.uploadCover),
  asyncHandler(companyService.uploadCover)
);

router.delete(
  "/cover/:id",
  isAuthanticated,
  isValid(companySchemas.deleteCoverPic),
  asyncHandler(companyService.deleteCoverPic)
);

router.delete(
  "/logo/:id",
  isAuthanticated,
  isValid(companySchemas.deleteLogo),
  asyncHandler(companyService.deleteLogo)
);

router.get(
  "/:id",
  isAuthanticated,
  isValid(companySchemas.getCompanyWithJobs),
  asyncHandler(companyService.getCompanyWithJobs)
);

router.post(
  "/add-hr/:id",
  isAuthanticated,
  isValid(companySchemas.addHr),
  asyncHandler(companyService.addHr)
);

export default router;
