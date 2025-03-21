const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event", // Reference to the event being reported
    required: true,
  },
  feedback: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who gave feedback
      rating: { type: Number, min: 1, max: 5 }, // Rating out of 5
      comment: { type: String },
    }
  ],
  totalRegistrations: {
    type: Number,
    required: true,
  },
  actualAttendees: {
    type: Number,
    required: true,
  },
  engagementScore: {
    type: Number, // Custom metric for measuring engagement
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Report", ReportSchema);

