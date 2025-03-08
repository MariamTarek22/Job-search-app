import { model, Schema, Types } from "mongoose";
import { genders } from "../constants/genders.js";
import { roles } from "../constants/roles.js";
import { hash } from "../utils/index.js";
import { calculateAge } from "../utils/calculateAge.js";
import { encrypt } from "../utils/index.js";

export const defaultProfilePic = "uploads/users/defaultPic.jpg";
export const defaultSecureUrl =
  "https://res.cloudinary.com/dbnke1vxl/image/upload/v1741298467/defaultPic_uydcdk.jpg";
export const defaultPublicKey = "defaultPic_uydcdk";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: [true, "email already exists"],
      lowercase: true,
    },
    //if signing in with google password is not required
    password: {
      type: String,
      required: function () {
        return this.provider == "system" ? true : false;
      },
    },
    firstName: {
      type: String,
      required: true,
      maxlength: 20,
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 20,
    },
    phone: {
      type: String,
      required: function () {
        //if signing in with google phone is not required
        return this.provider == "system" ? true : false;
      },
      unique: [true, "phone already exists"],
    },
    gender: { type: String, enum: Object.values(genders) },
    isConfirmed: { type: Boolean, default: false },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    bannedAt: {
      type: Date,
    },
    changeCredentialsTime: {
      type: Date,
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.USER,
    },
    profilePic: {
      secure_url: {
        type: String,
        default: defaultSecureUrl,
      },
      public_id: {
        type: String,
        default: defaultPublicKey,
      },
    },
    coverPic: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    provider: {
      type: String,
      enum: ["google", "system"],
      default: "system",
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    DOB: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          // Ensure DOB is before the current date
          if (new Date(value) >= new Date()) return false;
          // Ensure age is greater than 18
          const age = calculateAge(value);
          return age >= 18;
        },
        message:
          "Date of Birth must be in the past and age must be at least 18 years.",
      },
    },
    otp: [
      {
        code: { type: String, required: true }, // Hashed OTP
        type: {
          type: String,
          enum: ["confirmEmail", "forgetPassword"],
          required: true,
        },
        expiresIn: {
          type: Date,
          default: () => new Date(Date.now() + 10 * 60 * 1000),
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("userName").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});
userSchema.pre("save", function (next) {
  //hash pasword before saving document
  //this here refer to the document
  if (this.isModified("password"))
    this.password = hash({ data: this.password });
  if (this.isModified("phone")) this.phone = encrypt({ data: this.phone });
  return next();
});
const User = model("User", userSchema);
export default User;
