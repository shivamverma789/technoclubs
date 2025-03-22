const mongoose = require("mongoose");

const MembershipRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    domain: { type: String, enum: ["Technical", "Content", "Graphics", "Operations", "PR"], required: true },
    experience: { type: String, required: true },
    github: { type: String },
    linkedin: { type: String },
    availability: { type: String, required: true },
    resumeLink: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MembershipRequest", MembershipRequestSchema);
