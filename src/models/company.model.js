import { model, Schema, Types } from "mongoose";

const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: [true, "Company Name already exists"],
    },
    description: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    numberOfEmployees: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^\d+-\d+$/.test(value); // Ensures format like "11-20"
        },
        message:
          "Number of employees must be in the format 'min-max' (e.g., '11-20').",
      },
    },
    companyEmail: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already Exists"],
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    logo: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
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
    Hrs: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    bannedAt: {
      type: Date,
    },
    deleltedAt: {
      type: Date,
    },
    legalAttachment: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    approvedByAdmin: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
  }
);

companySchema.virtual("jobs",{
  ref:"Job",
  localField:"_id",
  foreignField:"company"
})

const Company = model("Company", companySchema);
export default Company;
