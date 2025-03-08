import CryptoJS from "crypto-js";
import User, {
  defaultSecureUrl,
  defaultPublicKey,
} from "../../models/user.model.js";
import { compare, messages } from "../../utils/index.js";
import cloudinary from "../../utils/fileUploads/cloud-config.js";

export const updateProfile = async (req, res, next) => {
  const { firstName, lastName, gender, phone, DOB } = req.body;
  const user = await User.findById(req.authUser._id);
  if (!user) return next(new Error(messages.user.notFound, { cause: 404 }));

  //update fields in user only if it is sent in body of req
  firstName && (user.firstName = firstName);
  lastName && (user.lastName = lastName);
  gender && (user.gender = gender);
  phone && (user.phone = phone);
  DOB && (user.DOB = DOB);

  await user.save();
  return res.status(200).json({
    success: true,
    message: messages.user.updatedSuccessfully,
    data: user,
  });
};

export const getProfile = async (req, res, next) => {
  const { authUser } = req;
  authUser.phone = CryptoJS.AES.decrypt(
    authUser.phone,
    process.env.CRYPTO_KEY
  ).toString(CryptoJS.enc.Utf8);
  res.status(200).json({
    success: true,
    userData: authUser,
  }); 
};

export const getSpecificProfile = async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).select(
    "userName phone profilePic coverPic"
  );
  user.phone = CryptoJS.AES.decrypt(
    user.phone,
    process.env.CRYPTO_KEY
  ).toString(CryptoJS.enc.Utf8);

  res.status(200).json({
    success: true,
    userData: user,
  });
};

export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const { authUser } = req;

  const user = await User.findById(authUser.id);
  if (!user) return next(new Error(messages.user.notFound, { cause: 404 }));
  const isMatch = compare({
    data: currentPassword,
    hashedData: authUser.password,
  });
  if (!isMatch)
    return next(new Error("Incorrect current password", { cause: 401 }));
  user.password = newPassword;
  user.changeCredentialsTime = Date.now();
  user.save();
  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
};

export const uploadProfilePic = async (req, res, next) => {
  const { file, authUser } = req;
  if (!file) return next(new Error("No file uploaded", { cause: 400 }));
  //destroy old profile pic in cloud before upload new one
  // await cloudinary.uploader.destroy(authUser.profilePic.public_id)

  //instead of using destory and two requests to cloudinary we can do an over write to the old profile pic name

  const options = {};
  if (authUser.profilePic.public_id == defaultPublicKey)
    options.folder = `job-search-app/user/${authUser._id}/profile-pic`;
  else options.public_id = authUser.profilePic.public_id; //overwrite the new image in the past image public id

  //upload image to cloud
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    options
  );

  //update path in db
  const user = await User.findByIdAndUpdate(
    authUser._id,
    {
      profilePic: { secure_url, public_id },
    },
    { new: true }
  );

  res.status(200).json({
    success: "true",
    message: "Profile Picture Updated Successfully!",
  });
};

export const uploadCoverPic = async (req, res, next) => {
  const { file, authUser } = req;
  if (!file) return next(new Error("No file uploaded", { cause: 400 }));
  const options = {};
  if (!authUser.coverPic.public_id)
    options.folder = `job-search-app/user/${authUser._id}/cover-pic`;
  else options.public_id = authUser.coverPic.public_id; //overwrite the new image in the past image public id

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    options
  );
  const user = await User.findOneAndUpdate(
    authUser._id,
    { coverPic: { secure_url, public_id } },
    {
      new: true, // so it return the user after update
    }
  );
  return res.status(200).json({
    success: true,
    message: "Cover pic uploaded successfully!",
  });
};

export const deleteProfilePic = async (req, res, next) => {
  const { authUser } = req;

  // 1. Delete profile pic file from Cloudinary if it exists
  if (authUser.profilePic?.public_id) {
    await cloudinary.uploader.destroy(authUser.profilePic.public_id);
  }

  // 2. Update profile pic path in DB with default values
  const user = await User.findByIdAndUpdate(
    authUser._id,
    {
      profilePic: {
        secure_url: defaultSecureUrl,
        public_id: defaultPublicKey,
      },
    },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Profile pic deleted successfully!",
  });
};

export const deleteCoverPic = async (req, res, next) => {
  const { authUser } = req;

  // 1. Delete profile pic file from Cloudinary if it exists
  if (authUser.coverPic?.public_id) {
    await cloudinary.uploader.destroy(authUser.coverPic.public_id);
  }

  // 2. Update profile pic path in DB with default values
  const user = await User.findByIdAndUpdate(
    authUser._id,
    {
      coverPic: "",
    },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Cover pic deleted successfully!",
  });
};

export const freezeAccount = async (req, res, next) => {
  const { authUser } = req;
  const updatedUser = await User.updateOne(
    { _id: authUser._id },
    { isDeleted: true, deletedAt: Date.now() }
  );
  return res.status(200).json({
    success: true,
    message: messages.user.deletedSuccessfully,
  });
};
