const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String, // Stores the image file path
      default: "", // Default value in case no image is uploaded
    },
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensures that each chapter has an assigned admin
    },
    president: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vicePresident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chapter", ChapterSchema);
