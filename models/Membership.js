const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the applying user
    required: true,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter", // Reference to the chapter being applied to
    required: true,
  },
  resume: {
    type: String, // URL or file path to resume
    required: true,
  },
  experience: {
    type: String,
    required: false, // Optional description of experience
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Membership", MembershipSchema);
