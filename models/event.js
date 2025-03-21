const mongoose = require("mongoose");

const SpeakerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  profilePhoto: { type: String }, // Store file path or URL
});

const EventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    poster: { type: String }, // Image path
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
    eventDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: String, required: true },
    venue: { type: String, required: true },
    speakers: [SpeakerSchema], // Array of speakers
    capacity: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    feeAmount: { type: Number, default: 0 },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true }, // Link to Chapter
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who registered
    status: { type: String, enum: ["upcoming", "past"], default: "upcoming" }, // Event status
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
