const express = require("express");
const { ensureRole, ensureAuthenticated } = require("../middleware/auth");
const Event = require("../models/Event");
const Chapter = require("../models/Chapter");

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
router.post("/create", ensureRole("chapteradmin"), async (req, res) => {
  try {
    const chapter = await Chapter.findOne({ _id: req.user.chapterId });
    if (!chapter) {
      req.flash("error_msg", "You are not assigned to any chapter.");
      return res.redirect("/dashboard/chapter");
    }

    const {
      name,
      poster,
      shortDescription,
      longDescription,
      eventDate,
      startTime,
      endTime,
      duration,
      venue,
      speakers,
      capacity,
      isPaid,
      feeAmount,
    } = req.body;

    const parsedSpeakers = JSON.parse(speakers); // Convert speaker JSON string to object

    const newEvent = new Event({
      name,
      poster,
      shortDescription,
      longDescription,
      eventDate,
      startTime,
      endTime,
      duration,
      venue,
      speakers: parsedSpeakers,
      capacity,
      isPaid: isPaid === "true",
      feeAmount: isPaid === "true" ? feeAmount : 0,
      chapterId: chapter._id, // Link event to the chapter
    });

    await newEvent.save();
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
    const event = await Event.findById(req.params.id).populate("chapterId speakers registeredUsers");
    if (!event) {
      req.flash("error_msg", "Event not found.");
      return res.redirect("/events");
    }
    res.render("eventDetails", { event });
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ GET Register for Event
router.get("/:id/register", ensureAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      req.flash("error_msg", "Event not found.");
      return res.redirect("/events");
    }

    if (event.registeredUsers.includes(req.user._id)) {
      req.flash("error_msg", "You are already registered for this event.");
      return res.redirect(`/events/${event._id}`);
    }

    event.registeredUsers.push(req.user._id);
    await event.save();

    req.flash("success_msg", "Successfully registered for the event!");
    res.redirect(`/events/${event._id}`);
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
