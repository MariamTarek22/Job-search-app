import jwt from "jsonwebtoken";

export const verifyToken = ({ token, secretKey = process.env.SECRET_KEY }) => {
  try{
    return jwt.verify(token, secretKey);
  }catch(error){
    return {error}
  }
};
