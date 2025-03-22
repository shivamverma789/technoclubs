const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  liked: { type: String, required: true },
  suggestions: { type: String, required: true },
  managementRating: { type: Number, required: true, min: 1, max: 5 },
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
