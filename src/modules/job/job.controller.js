import { Router } from "express";
import * as jobService from "./job.service.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import * as jobSchemas from "./job.schema.js";
import { isAuthanticated } from "../../middlewares/auth.middleware.js";
import { isAuthorized } from "../../middlewares/authorization.middleware.js";
import { roles } from "../../constants/roles.js";
import {
  cloudUpload,
  fileValidation,
} from "../../utils/fileUploads/multer-cloud.js";

const router = Router({ mergeParams: true });

router.get(
  "/all",
  isAuthanticated,
  isValid(jobSchemas.getAllJobsWithFilters),
  asyncHandler(jobService.getAllJobsWithFilters)
);

router.get(
  "/:jobId?",
  isAuthanticated,
  isValid(jobSchemas.getJobsForCompany),
  asyncHandler(jobService.getJobsForCompany)
);

//add job
router.post(
  "/",
  isAuthanticated,
  isValid(jobSchemas.addJob),
  asyncHandler(jobService.addJob)
);

router.patch(
  "/update/:jobId",
  isAuthanticated,
  isValid(jobSchemas.updateJob),
  asyncHandler(jobService.updateJob)
);

router.delete(
  "/:jobId",
  isAuthanticated,
  isValid(jobSchemas.deleteJob),
  asyncHandler(jobService.deleteJob)
);

router.get(
  "/:jobId/applications",
  isAuthanticated,
  isValid(jobSchemas.getApplicationsForJob),
  asyncHandler(jobService.getApplicationsForJob)
);

//apply to job (create job application)
router.post(
  "/apply/:jobId",
  isAuthanticated,
  isAuthorized(roles.USER),
  cloudUpload(fileValidation.files).single("attachment"),
  isValid(jobSchemas.applyToJob),
  asyncHandler(jobService.applyToJob)
);

router.patch(
  "/:jobId/status/:appId",
  isAuthanticated,
  isValid(jobSchemas.changeApplicationStatus),
  asyncHandler(jobService.changeApplicationStatus)
);

export default router;
