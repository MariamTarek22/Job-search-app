import Company from "../../models/company.model.js";
import User from "../../models/user.model.js";

export const getAllDataQuery = async () => {
  const users = await User.find();
  const companies = await Company.find();
  return { users, companies };
};
