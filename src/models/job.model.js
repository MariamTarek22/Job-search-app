import { model, Schema, Types } from "mongoose";
import {
  locations,
  seniorityLevels,
  workingTimes,
} from "../constants/jobRelated.js";

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      enum: locations,
      required: true,
    },
    workingTime: {
      type: String,
      enum: workingTimes,
      required: true,
    },
    seniorityLevel: {
      type: String,
      enum: {
        values: seniorityLevels,
        message:
          "Seniority level must be one of: Fresh, Junior, Mid-Level, Senior, Team-Lead, CTO",
      },
      required: true,
    },
    technicalSkills: [String],
    softSkills: [String],
    addedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    closed: {
      type: Boolean,
      default: false,
    },
    company: {
      type: Types.ObjectId,
      ref: "Company",
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "job",
});

const Job = model("Job", jobSchema);
export default Job;
