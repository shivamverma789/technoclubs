const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    college: { type: String },
    degree: { type: String },
    role: { type: String, enum: ["superadmin", "chapteradmin", "user"], default: "user" },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }, // 🔹 Link user to a chapter
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
