import mongoose from "mongoose";
import Company from "../../models/company.model.js";
import User from "../../models/user.model.js";
import cloudinary from "../../utils/fileUploads/cloud-config.js";
import { messages } from "../../utils/index.js";

export const addCompany = async (req, res, next) => {
  const { file, authUser } = req;
  const {
    companyEmail,
    companyName,
    address,
    numberOfEmployees,
    industry,
    description,
  } = req.body;

  if (!file)
    return next(new Error("No legal attachment is uploaded", { cause: 400 }));

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      folder: `job-search-app/user/${authUser._id}/company/${companyName}/legal-attachment`,
    }
  );
  const isExist = await Company.find({ companyEmail, companyName });
  if (isExist.length > 0) {
    return next(new Error("Company already exists", { cause: 400 }));
  }

  const company = await Company.create({
    companyEmail,
    companyName,
    address,
    numberOfEmployees,
    industry,
    description,
    createdBy: req.authUser._id,
    legalAttachment: {
      secure_url,
      public_id,
    },
  });

  res.status(201).json({ message: "Company created successfully", company });
};

export const updateCompanyData = async (req, res, next) => {
  const {
    companyEmail,
    companyName,
    address,
    numberOfEmployees,
    industry,
    description,
  } = req.body;
  const { id } = req.params;

  //if req.body is empty
  if (Object.keys(req.body).length === 0)
    return next(new Error("No data is provided", { cause: 400 }));

  //if company id not found
  const company = await Company.findById(id);
  if (!company || deleltedAt)
    return next(new Error("Company not found", { cause: 404 }));

  //if company email or name is not unique
  if (companyEmail || companyName) {
    let findBy = {};
    if (companyEmail) findBy.companyEmail = companyEmail;
    if (companyName) findBy.companyName = companyName;
    const isExist = await Company.find(findBy);

    if (isExist.length > 0)
      return next(
        new Error("Company Name or Email already exist", { cause: 404 })
      );
  }

  //if user not the company owner
  if (company.createdBy.toString() !== req.authUser.id)
    return next(
      new Error("You are not authorized to update this company", { cause: 403 })
    );

  //assign changed values if exist
  companyEmail && (company.companyEmail = companyEmail);
  companyName && (company.companyName = companyName);
  address && (company.address = address);
  numberOfEmployees && (company.numberOfEmployees = numberOfEmployees);
  industry && (company.industry = industry);
  description && (company.description = description);

  await company.save();
  res.status(200).json({ message: "Company updated successfully", company });
};

export const softDeleteCompany = async (req, res, next) => {
  const { id } = req.params;
  const company = await Company.findById(id);
  if (!company || company.deleltedAt)
    return next(new Error("Company not found", { cause: 404 }));
  if (
    company.createdBy.toString() !== req.authUser.id ||
    req.authUser.role !== "admin"
  )
    return next(
      new Error("You are not authorized to delete this company", { cause: 403 })
    );
  company.deleltedAt = Date.now();

  await company.save();
  res.status(200).json({ message: "Company deleted successfully" });
};

export const getCompanyWithJobs = async (req, res, next) => {
  const { id } = req.params;
  const company = await Company.findById(id).populate({ path: "jobs" });

  if (!company) return next(new Error("company not found"));
  return res.status(200).json({
    success: true,
    data: company,
  });
};

export const searchCompany = async (req, res, next) => {
  const { name } = req.query;
  const companies = await Company.find({
    companyName: { $regex: name, $options: "i" },
    deleltedAt: null,
  });
  return res.status(200).json({
    success: true,
    data: companies,
  });
};

export const uploadLogo = async (req, res, next) => {
  const { file, authUser } = req;
  const { id } = req.params;
  if (!file) return next(new Error("No file uploaded", { cause: 400 }));

  const company = await Company.findById(id);
  if (!company) return next(new Error("company not found", { cause: 404 }));

  if (company.createdBy.toString() !== req.authUser.id)
    return next(new Error("Your not authorized", { cause: 403 }));

  const options = {};
  if (!company.logo.public_id)
    options.folder = `job-search-app/user/${authUser._id}/company/${company.companyName}/logo`;
  else options.public_id = company.logo.public_id; //overwrite the new image in the past image public id

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    options
  );
  const updatedCompany = await Company.findOneAndUpdate(
    company._id,
    { logo: { secure_url, public_id } },
    {
      new: true, // so it return the company after update
    }
  );
  return res.status(200).json({
    success: true,
    message: "Logo uploaded successfully!",
    data: updatedCompany,
  });
};

export const uploadCover = async (req, res, next) => {
  const { file, authUser } = req;
  const { id } = req.params;
  if (!file) return next(new Error("No file uploaded", { cause: 400 }));

  const company = await Company.findById(id);
  if (!company) return next(new Error("company not found", { cause: 404 }));

  if (company.createdBy.toString() !== req.authUser.id)
    return next(new Error("Your not authorized", { cause: 403 }));

  const options = {};
  if (!company.coverPic.public_id)
    options.folder = `job-search-app/user/${authUser._id}/company/${company.companyName}/coverPic`;
  else options.public_id = company.coverPic.public_id; //overwrite the new image in the past image public id

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    options
  );
  const updatedCompany = await Company.findOneAndUpdate(
    company._id,
    { coverPic: { secure_url, public_id } },
    {
      new: true, // so it return the company after update
    }
  );
  return res.status(200).json({
    success: true,
    message: "Cover uploaded successfully!",
    data: updatedCompany,
  });
};

export const deleteCoverPic = async (req, res, next) => {
  const { authUser } = req;
  const { id } = req.params;
  const company = await Company.findById(id);

  if (!company) return next(new Error("company not found", { cause: 404 }));

  if (!company.coverPic?.public_id)
    return next(new Error("No Cover Pic to delete"));

  if (company.createdBy.toString() !== authUser.id)
    return next(new Error("Your not authorized", { cause: 403 }));

  // 1. Delete cover pic file from Cloudinary if it exists
  if (company.coverPic?.public_id) {
    await cloudinary.uploader.destroy(company.coverPic.public_id);
  }

  // 2. Update cover pic path in DB with default values
  const updatedCompany = await Company.findByIdAndUpdate(
    company._id,
    {
      coverPic: null,
    },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Cover pic deleted successfully!",
    data: updatedCompany,
  });
};

export const deleteLogo = async (req, res, next) => {
  const { authUser } = req;
  const { id } = req.params;
  const company = await Company.findById(id);

  if (!company) return next(new Error("company not found", { cause: 404 }));

  if (!company.logo.public_id) return next(new Error("No Logo to delete"));

  if (company.createdBy.toString() !== authUser.id)
    return next(new Error("Your not authorized", { cause: 403 }));

  // 1. Delete cover pic file from Cloudinary if it exists
  if (company.logo?.public_id) {
    await cloudinary.uploader.destroy(company.logo.public_id);
  }

  // 2. Update cover pic path in DB with default values
  const updatedCompany = await Company.findByIdAndUpdate(
    company._id,
    {
      logo: null,
    },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Logo deleted successfully!",
    data: updatedCompany,
  });
};

export const addHr = async (req, res, next) => {
  const { id } = req.params;
  const { user } = req.body;
  const company = await Company.findById(id);
  if (!company) return next(new Error("Company not found", { cause: 404 }));

  const userExist = await User.findById(user);
  if (!userExist) return next(new Error("User not found", { cause: 404 }));

  const isHR = company.Hrs?.some((hrId) => hrId.toString() === user);
  if (isHR) return next(new Error("User is already an HR", { cause: 400 }));


  //only company owner can add another hr
  if (req.authUser.id != company.createdBy.toString())
    return next(new Error("you are not authorized", { cause: 403 }));

  const userId = new mongoose.Types.ObjectId(user); // Convert string to ObjectId

  company.Hrs.push(userId);
  await company.save();

  return res.status(200).json({
    success: true,
    message: "User added as HR successfully!",
  });
};
