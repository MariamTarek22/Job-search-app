import User from "./../../models/user.model.js";
import {
  compare,
  generateToken,
  verifyToken,
  sendEmailEvent,
  messages,
  hash,
} from "../../utils/index.js";
import Randomstring from "randomstring";
import { OAuth2Client } from "google-auth-library";

export const signUp = async (req, res, next) => {
  const { firstName, lastName, email, password, phone, role, gender, DOB } =
    req.body;
  //check user existance
  const userExist = await User.findOne({ email });
  if (userExist)
    if (userExist.isConfirmed)
      return next(new Error(messages.user.alreadyExist, { cause: 404 }));
    else
      return next(
        new Error(
          "User already Exists but need otp Confirmation, Request new otp to complete signup"
        )
      );

  const otp = Randomstring.generate({ length: 5, charset: "numeric" });

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    otp: {
      code: hash({ data: otp }),
      type: "confirmEmail",
      expiresIn: Date.now() + 10 * 60 * 100,
    },
    role,
    gender,
    DOB,
    phone,
  });
  sendEmailEvent.emit("sendEmail", email, otp);
  return res.status(201).json({
    success: true,
    message: "OTP sent! please verify your email within 10 Minutues.",
  });
};

export const confirmOtp = async (req, res, next) => {
  const { otp, email, type } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error(messages.user.notFound, { cause: 404 }));

  // Find the matching OTP entry
  const otpEntry = user.otp.find(
    (o) => o.type === type && compare({ data: otp, hashedData: o.code })
  );

  // Check if OTP exists and is valid
  if (!otpEntry) return next(new Error("Invalid OTP", { cause: 400 }));

  if (Date.now() > otpEntry.expiresIn)
    return next(new Error("otp Expired Request a new one", { cause: 404 }));

  // Mark OTP as expired instead of removing it
  user.otp = user.otp.map((o) =>
    o === otpEntry ? { ...o, expiresIn: new Date(0) } : o
  );
  user.isConfirmed = true;
  await user.save();
  return res.json({ message: "Email confirmed successfully", data: user });
};

export const resendOtp = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error(messages.user.notFound, { cause: 404 }));
  const otp = Randomstring.generate({ length: 5, charset: "numeric" });
  user.otp.push({
    code: hash({ data: otp }),
    type: "confirmEmail",
    expiresIn: Date.now() + 10 * 60 * 100,
  });
  await user.save();
  //send new otp
  sendEmailEvent.emit("sendEmail", email, otp);
  return res.json({ message: "New OTP sent successfully to your email." });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  //check email
  const userExist = await User.findOne({ email });
  if (!userExist) return next(new Error("user not found", { cause: 404 }));
  //check password
  const isMatch = compare({ data: password, hashedData: userExist.password });
  if (!isMatch) return next(new Error("invalid password", { cause: 404 }));

  const accessToken = generateToken({
    payload: { id: userExist._id },
    options: { expiresIn: "1h" },
  });
  const refreshToken = generateToken({
    payload: { id: userExist._id },
    options: { expiresIn: "7d" },
  });
  //verify activation before loging in
  if (!userExist.isConfirmed)
    return next(
      new Error(
        "Please verify your account through request new otp and confirm it first",
        { cause: 401 }
      )
    );
  if (userExist.isDeleted)
    //if was freezed defreeze it when he login
    await User.updateOne({ _id: userExist._id }, { isDeleted: false });
  //return success response
  return res.status(200).json({
    success: true,
    message: "user logged in successfully",
    access_token: accessToken,
    refresh_token: refreshToken,
  });
};

export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  const { id, error, iat } = verifyToken({ token: refreshToken });
  if (error) return next(new Error(error.message));

  //check if a credentails change have been done after the refreshtoken generated to prevent using expired tokens
  const userExist = await User.findOne({ _id: id });
  if (
    userExist.changeCredentialsTime &&
    userExist.changeCredentialsTime.getTime() > iat * 1000
  )
    return next(
      new Error("Token Expired due to credentials change, please login again", {
        cause: 403,
      })
    );
    
  //generate access token if refreshtoken is valid
  const accessToken = generateToken({
    payload: { id },
    options: { expiresIn: "1h" },
  });
  return res.status(201).json({
    success: true,
    message: "refresh token is valid, here is the new access token",
    access_token: accessToken,
  });
};

const verifyGoogleToken = async (idToken) => {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
};

export const googleLogin = async (req, res, next) => {
  //get data from req
  const { idToken } = req.body;

  //verify it from google
  const { name, email, picture } = await verifyGoogleToken(idToken);

  //check email existance
  const userexist = await User.findOne({ email });
  if (!userexist) {
    const user = await User.create({
      userName: name,
      email,
      profilePic: picture,
      provider: "google",
    });

    const accessToken = generateToken({
      payload: { id: user._id },
      options: { expiresIn: "1h" },
    });
    const refreshToken = generateToken({
      payload: { id: user._id },
      options: { expiresIn: "7d" },
    });
    //verify activation before loging in
    if (!user.isConfirmed)
      return next(
        new Error(
          "Please activate your account through email sent to you first",
          { cause: 401 }
        )
      );
    if (user.isDeleted)
      //if was freezed defreeze it when he login
      await User.updateOne({ _id: user._id }, { isDeleted: false });
    //return success response
    return res.status(200).json({
      success: true,
      message: "user logged in successfully",
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found", { cause: 404 }));
  const otp = Randomstring.generate({ length: 5, charset: "numeric" });
  user.otp.push({
    code: hash({ data: otp }),
    type: "forgetPassword",
    expiresIn: Date.now() + 10 * 60 * 1000,
  });
  await user.save();
  //send email with otp
  sendEmailEvent.emit("sendEmail", email, otp);
  return res.status(200).json({
    success: true,
    message: "OTP sent to your email, Please, verify within 10 minutes.",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  // Find the matching OTP entry
  const otpEntry = user.otp.find(
    (o) =>
      o.type === "forgetPassword" && compare({ data: otp, hashedData: o.code })
  );

  // Check if OTP exists and is valid
  if (!otpEntry) return next(new Error("Invalid OTP", { cause: 400 }));

  if (Date.now() > otpEntry.expiresIn)
    return next(new Error("otp Expired Request a new one", { cause: 404 }));

  // Mark OTP as expired instead of removing it
  user.otp = user.otp.map((o) =>
    o === otpEntry ? { ...o, expiresIn: new Date(0) } : o
  );
  user.password = newPassword;
  user.changeCredentialsTime = Date.now();
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};
