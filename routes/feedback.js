const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth");

const Feedback = require("../models/Feedback");
const Event = require("../models/Event");
const User = require("../models/User");

// ✅ POST - Submit Feedback
router.post("/submit", ensureAuthenticated, async (req, res) => {
  try {
    const { eventId, overallRating, liked, suggestions, managementRating } = req.body;

    const event = await Event.findById(eventId);
    if (!event || event.status !== "Past") {
      req.flash("error_msg", "Invalid event.");
      return res.redirect("/events");
    }

    const existingFeedback = await Feedback.findOne({ userId: req.user._id, eventId });
    if (existingFeedback) {
      req.flash("error_msg", "You have already submitted feedback for this event.");
      return res.redirect(`/events/${eventId}`);
    }

    const feedback = new Feedback({
      userId: req.user._id,
      eventId,
      overallRating,
      liked,
      suggestions,
      managementRating,
    });

    await feedback.save();

    // ✅ Increment user credits by 50
    await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 50 } });

    req.flash("success_msg", "Feedback submitted! 50 credits added.");
    res.redirect(`/events/${eventId}`);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
