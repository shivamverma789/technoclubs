const express = require("express");
const { ensureRole, ensureAuthenticated } = require("../middleware/auth");
const Event = require("../models/Event");
const Chapter = require("../models/Chapter");
const User = require("../models/User");
const multer = require("multer");
const upload = require("../middleware/multer"); // Import Multer middleware

const router = express.Router();

// ✅ GET Create Event Page (Only Chapter Admin)
router.get("/create", ensureRole("chapteradmin"), async (req, res) => {
  try {
    const chapter = await Chapter.findOne({ _id: req.user.chapterId }); // Get chapter of logged-in admin
    if (!chapter) {
      req.flash("error_msg", "You are not assigned to any chapter.");
      return res.redirect("/dashboard/chapter");
    }
    res.render("createEvent", { chapter });
  } catch (error) {
    console.error("Error loading create event page:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ POST Create Event (Only Chapter Admin)
router.post("/create", ensureRole("chapteradmin"), upload, async (req, res) => {
  try {
    const chapter = await Chapter.findOne({ _id: req.user.chapterId });
    if (!chapter) {
      req.flash("error_msg", "You are not assigned to any chapter.");
      return res.redirect("/dashboard/chapter");
    }

    const {
      name,
      shortDescription,
      longDescription,
      eventDate,
      startTime,
      endTime,
      duration,
      venue,
      capacity,
      isPaid,
      feeAmount,
      speakerName,
      speakerDescription,
    } = req.body;

    // Handle Speaker Details (Multiple Speakers)
    const speakers = [];
    if (Array.isArray(speakerName)) {
      for (let i = 0; i < speakerName.length; i++) {
        speakers.push({
          name: speakerName[i],
          description: speakerDescription[i],
          profilePhoto: req.files[speakerProfile[${i}]] ? req.files[speakerProfile[${i}]][0].filename : null,
        });
      }
    } else if (speakerName) {
      // If only one speaker is provided
      speakers.push({
        name: speakerName,
        description: speakerDescription,
        profilePhoto: req.files["speakerProfile"] ? req.files["speakerProfile"][0].filename : null,
      });
    }

    // Create Event Object
    const newEvent = new Event({
      name,
      poster: req.files["poster"] ? req.files["poster"][0].filename : null,
      shortDescription,
      longDescription,
      eventDate,
      startTime,
      endTime,
      duration,
      venue,
      speakers,
      capacity,
      isPaid: isPaid === "true",
      feeAmount: isPaid === "true" ? feeAmount : 0,
      chapterId: chapter._id,
    });

    await newEvent.save();

    // ✅ Link Event to Chapter
    chapter.events.push(newEvent._id);
    await chapter.save();

    req.flash("success_msg", "Event created successfully!");
    res.redirect("/dashboard/chapter");
  } catch (error) {
    console.error("Error creating event:", error);
    req.flash("error_msg", "Something went wrong. Try again.");
    res.redirect("/events/create");
  }
});



// ✅ GET All Events (Visible to Students)
router.get("/", async (req, res) => {
  try {
    const upcomingEvents = await Event.find({ status: "upcoming" }).populate("chapterId");
    const pastEvents = await Event.find({ status: "past" }).populate("chapterId");

    res.render("events", { upcomingEvents, pastEvents });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Server Error");
  }
});


// ✅ GET Event Details
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("chapterId speakers registeredUsers")
      .lean(); // Convert to plain JS object for better performance in EJS

    if (!event) {
      req.flash("error_msg", "Event not found.");
      return res.redirect("/events");
    }

    // Ensure there are speakers (handle multiple speakers)
    const speakers = event.speakers.length ? event.speakers : [];

    // Check if the user is logged in and registered
    const isRegistered = req.user
      ? event.registeredUsers.some(user => user._id.toString() === req.user._id.toString())
      : false;

      const showRegisterButton = event.status === "upcoming" && !isRegistered;

    res.render("eventDetails", { event, speakers, isRegistered,showRegisterButton, user: req.user || null });
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).send("Server Error");
  }
});



// ✅ GET Register for Event
router.post("/register/:eventId", ensureAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      req.flash("error_msg", "Event not found.");
      return res.redirect("/events");
    }

    // Check if user is already registered
    if (event.registeredUsers.includes(req.user._id)) {
      req.flash("error_msg", "You have already registered for this event.");
      return res.redirect(/events/${event._id});
    }

    // Register the user
    event.registeredUsers.push(req.user._id);
    await event.save();

    req.flash("success_msg", "You have successfully registered for the event!");
    res.redirect(/events/${event._id});
  } catch (error) {
    console.error("Error registering for event:", error);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/events");
  }
});

module.exports = router;