import User from "../models/user.model.js";
import { messages, verifyToken } from "../utils/index.js";
import { Types } from "mongoose";

export const isAuthanticated = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization)
      return next(new Error("token is required", { cause: 400 }));
    if (!authorization.startsWith("meme"))
      return next(new Error("invalid bearer key", { cause: 400 }));
    const token = authorization.split(" ")[1];
    const { id, error, iat } = verifyToken({ token });
    if (error) return next(error); //invalid token
    const user = await User.findById(id);
    if (!user) return next(new Error(messages.user.notFound, { cause: 404 }));
    if (user.isDeleted)
      return next(
        new Error("Your account is freezed, Please Login First", { cause: 400 })
      ); 
    // if user account is freezed  (soft deleted) and wanted an access with an old token
    else {
      //if not deleted            
      //if token was generated one before deletation
      if (user?.deletedAt?.getTime() > iat * 1000)
        // get time convert time to seconds while iat is in miunites so *1000 to be both in the same unit
        return next(
          new Error("Destroyed token login to get a valid one", { cause: 400 })
        );
    }
    //pass user data to req before going to next
    req.authUser = user;
    //if userExist
    return next();
  } catch (error) {
    return next(error);
  }
};

export const isValidId = (value, helpers) => {
  //validation on sent id type is valid or not
  if (!Types.ObjectId.isValid(value)) return helpers.message("InValid Id");
  else return true;
};
