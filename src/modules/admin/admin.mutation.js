import Company from "../../models/company.model.js";
import User from "../../models/user.model.js";

export const banOrUnBanUserMutation = async (_, { id }) => {
  const user = await User.findById(id);

  if (!user) throw new Error("User not found");

  // Toggle ban status
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { bannedAt: user.bannedAt ? null : Date.now() },
    { new: true }
  );

  return updatedUser;
};

export const banOrUnBanCompanyMutation = async (_, { id }) => {
  const company = await Company.findById(id);

  if (!company) throw new Error("Company not found");

  // Toggle ban status
  const updatedCompany = await Company.findByIdAndUpdate(
    id,
    { bannedAt: company.bannedAt ? null : Date.now() },
    { new: true }
  );

  return updatedCompany;
};

export const approveCompanyMutation = async (_, { id }) => {
  const company = await Company.findById(id);
  if (!company) throw new Error("Company not found");
  // Approve company
  const updatedCompany = await Company.findByIdAndUpdate(
    { id },
    { approvedByAdmin: true }
  );
  return updatedCompany;
};
