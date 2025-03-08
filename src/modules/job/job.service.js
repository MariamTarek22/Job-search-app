import Application from "../../models/application.model.js";
import Company from "../../models/company.model.js";
import Job from "../../models/job.model.js";
import cloudinary from "../../utils/fileUploads/cloud-config.js";
import { Types } from "mongoose";
import { io } from "../../../index.js";
import { sendEmail } from "../../utils/index.js";

export const addJob = async (req, res, next) => {
  const { authUser } = req;
  const { companyId } = req.params;
  const {
    title,
    description,
    location,
    workingTime,
    seniorityLevel,
    technicalSkills,
    softSkills,
  } = req.body;

  const company = await Company.findById(companyId);
  if (!company) {
    return next(new Error("Company to attach job not found", { cause: 400 }));
  }

  const job = await Job.create({
    title,
    description,
    location,
    workingTime,
    seniorityLevel,
    technicalSkills,
    softSkills,
    company: new Types.ObjectId(companyId),
    addedBy: authUser._id,
  });

  return res
    .status(201)
    .json({ success: true, message: "Job created successfully", data: job });
};

export const updateJob = async (req, res, next) => {
  const { companyId, jobId } = req.params;
  const {
    title,
    description,
    location,
    workingTime,
    seniorityLevel,
    technicalSkills,
    softSkills,
  } = req.body;

  //if req.body is empty
  if (Object.keys(req.body).length === 0)
    return next(new Error("No data is provided", { cause: 400 }));

  //if job id not found
  const job = await Job.findOne({
    _id: new Types.ObjectId(jobId),
    company: new Types.ObjectId(companyId),
  });

  if (!job) return next(new Error("Job not found", { cause: 404 }));

  //if user not the job owner
  if (job.addedBy.toString() !== req.authUser.id)
    return next(
      new Error("You are not authorized to update this job", { cause: 403 })
    );

  //assign changed values if exist
  title && (job.title = title);
  workingTime && (job.workingTime = workingTime);
  location && (job.location = location);
  seniorityLevel && (job.seniorityLevel = seniorityLevel);
  technicalSkills && (job.technicalSkills = technicalSkills);
  softSkills && (job.softSkills = softSkills);
  description && (job.description = description);
  job.updatedBy = req.authUser._id;

  await job.save();
  res.status(200).json({ message: "Job updated successfully", data: job });
};

export const deleteJob = async (req, res, next) => {
  const { jobId, companyId } = req.params;

  const job = await Job.findById(jobId).populate({ path: "company" });
  if (!job) return next(new Error("Job not found", { cause: 404 }));

  // Check if the job belongs to the correct company
  if (job.company._id.toString() !== companyId) {
    return next(
      new Error("This job does not belong to the given company", { cause: 400 })
    );
  }

  //authorized users to delete job is either the job owner or company related hrs
  const isAuthorized =
    req.authUser._id.toString() == job.addedBy.toString() ||
    job.company?.Hrs?.some(
      (id) => id.toString() == req.authUser._id.toString()
    );
  if (!isAuthorized) {
    return next(
      new Error("You are not authorized to delete this job", { cause: 403 })
    );
  }

  // Perform job deletion
  await Job.findByIdAndDelete(jobId);

  res.status(200).json({ success: true, message: "Job deleted successfully" });
};

export const getJobsForCompany = async (req, res, next) => {
  const { jobId, companyId } = req.params;
  const { page = 1, limit = 10, sort = "createdAt", search = "" } = req.query;

  const skip = (page - 1) * limit;

  let company;

  //if i dont get the companany id in the path get it by searched companyName
  if (!companyId && search) {
    company = await Company.findOne({
      companyName: { $regex: search, $options: "i" },
      deleltedAt: null,
    });
    if (!company)
      return next(new Error("Company with this search name not found"));
  }
  let companyIdToUse = companyId || company?._id;

  //get secific job if requested
  if (jobId) {
    const job = await Job.findOne({
      _id: jobId,
      company: companyIdToUse,
    }).populate({ path: "company" });

    return job
      ? res.status(200).json({
          success: true,
          message: "Job retived successfully",
          data: job,
        })
      : res.status(404).json({
          success: false,
          message: "job not found",
        });
  }

  //get all jobs if not
  const jobs = await Job.find({ company: companyIdToUse })
    .sort({ [sort]: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  const totalCount = await Job.countDocuments({ company: companyIdToUse });

  return res.status(200).json({
    success: true,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    page: parseInt(page),
    limit: parseInt(limit),
    jobs,
  });
};

export const getAllJobsWithFilters = async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    sort = "createdAt",
    title,
    location,
    workingTime,
    seniorityLevel,
    technicalSkills,
  } = req.query;

  const skip = (page - 1) * limit;
  let filters = {};
  if (workingTime) filters.workingTime = workingTime;
  if (title) filters.title = { $regex: title, $options: "i" };
  if (location) filters.location = location;
  if (seniorityLevel) filters.seniorityLevel = seniorityLevel;
  if (technicalSkills) {
    //covert comma separated string to an array of skills
    const skillsArray = technicalSkills.split(",").map((skill) => skill.trim());

    filters.technicalSkills = { $all: skillsArray }; //ensure job have all requested skills
  }

  const jobs = await Job.find(filters)
    .sort({ [sort]: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  const totalCount = await Job.countDocuments(filters);
  res.status(200).json({
    success: true,
    totalCount,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalCount / limit),
    jobs,
  });
};

export const getApplicationsForJob = async (req, res, next) => {
  const { jobId } = req.params;
  const { page = 1, limit = 10, sort = "createdAt" } = req.query;
  const job = await Job.findById(jobId).populate({
    path: "applications",
    populate: { path: "user" },
  });
  if (!job) return next(new Error("Job not found", { cause: 404 }));

  //apply pagination on the jobs.applications instead of quering again on the application model
  const skip = (page - 1) * limit;
  const applications = job.applications
    .sort((a, b) => b[sort] - a[sort])
    .slice(skip, skip + limit);
  return res.status(200).json({
    success: true,
    totalCount: job.applications.length,
    data: applications,
  });
};

export const applyToJob = async (req, res, next) => {
  const { jobId } = req.params;
  const { authUser, file } = req;
  const job = await Job.findById(jobId).populate({ path: "company" });
  if (!job) return next(new Error("Job not found", { cause: 404 }));

  const existingApplication = await Application.findOne({
    user: authUser._id,
    job: jobId,
  });

  if (existingApplication)
    return next(new Error("Already Applied!", { cause: 400 }));
  let applicationData = {
    user: authUser._id,
    job: jobId,
  };
  if (file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `job-search-app/user/${authUser._id}/cv`,
      }
    );
    applicationData.userCv = {
      secure_url,
      public_id,
    };
  }

  const jobApplication = await Application.create(applicationData);

  io.emit("newJobApplication", {
    jobId,
    userId: req.authUser._id,
    message: "A new application has been submitted",
  });
  return res.status(200).json({
    message: "Application submitted successfully! ",
  });
};

export const changeApplicationStatus = async (req, res, next) => {
  const { jobId, appId } = req.params;
  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status.toLowerCase()))
    return next(new Error("Invalid status value", { cause: 400 }));
  const application = await Application.findById(appId).populate("user job");

  if (!application)
    return next(new Error("Application not found", { cause: 404 }));
  application.status = status;
  await application.save();

  const { user, job } = application;
  const subject =
    status.toLowerCase() === "accepted"
      ? "Congratulations! You've been accepted."
      : "Job Application update";
  const message =
    status.toLowerCase() === "accepted"
      ? `Dear ${user.firstName},\n\n Congratulations! You've been accepted for the postion of ${job.title}. \n\n Best regards,\n Hr Team`
      : `Dear ${user.firstName},\n\n Unfortunately! Your application for ${job.title} has been rejected. keep applying for other positions. \n\n Best regards,\n Hr Team`;

  await sendEmail({to:user.email, subject,html: message});
  io.emit(`JobApplication:${user._id}`, { appId, status, jobId });
  return res.status(200).json({
    success: true,
    message: `Application have been ${status} successfully.`,
    application,
  });
};
