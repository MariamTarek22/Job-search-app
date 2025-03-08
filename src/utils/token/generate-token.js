import jwt from "jsonwebtoken";

export const generateToken = ({
  payload,
  secretKey = process.env.SECRET_KEY,
  options = {},
}) => {
  return jwt.sign(payload, secretKey, options);
};
