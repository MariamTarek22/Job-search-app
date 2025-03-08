import { Schema, Types, model } from "mongoose";

const status = ["pending", "accepted", "rejected", "viewed", "in considration"];
const applicationSchema = new Schema({
  job: {
    type: Types.ObjectId,
    ref: "Job",
  },
  user: {
    type: Types.ObjectId,
    ref: "User",
  },
  userCv: {
    secure_url: String,
    public_id: String,
  },
  status: {
    type: String,
    enum: status,
    default: "pending",
  },
});

const Application = model("Application", applicationSchema);

export default Application;
