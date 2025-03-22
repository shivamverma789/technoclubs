const express = require("express");
const { ensureRole, ensureAuthenticated } = require("../middleware/auth");
const Chapter = require("../models/Chapter");
const User = require("../models/User");
const upload = require("../middleware/multer");

const router = express.Router();

// ✅ GET All Chapters (Visible to all users)
router.get("/", async (req, res) => {
  try {
    const chapters = await Chapter.find().populate("president vicePresident coordinator teamMembers");
    res.render("chapters", { chapters });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ GET Create Chapter Page (Only Super Admin)
router.get("/create", ensureRole("superadmin"), async (req, res) => {
  try {
    const users = await User.find({}, "name _id"); // Get all users
    res.render("createChapter", { users });
  } catch (error) {
    console.error("Error loading create chapter page:", error);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/dashboard/admin");
  }
});


// ✅ POST Create Chapter (Only Super Admin)

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

    // ✅ Handle Speaker Details (Multiple Speakers)
    const speakers = [];
    if (Array.isArray(speakerName)) {
      for (let i = 0; i < speakerName.length; i++) {
        speakers.push({
          name: speakerName[i],
          description: speakerDescription[i],
          profilePhoto: req.files["speakerProfile[]"] && req.files["speakerProfile[]"][i]
            ? req.files["speakerProfile[]"][i].filename
            : null,
        });
      }
    } else if (speakerName) {
      // If only one speaker is provided
      speakers.push({
        name: speakerName,
        description: speakerDescription,
        profilePhoto: req.files["speakerProfile[]"] ? req.files["speakerProfile[]"][0].filename : null,
      });
    }

    // ✅ Create Event Object
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





// ✅ GET Chapter Details Page
router.get("/:id", async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate("president vicePresident coordinator admin teamMembers")
      .populate({
        path: "events",
        options: { sort: { eventDate: 1 } }, // Sort events by date
      });

    if (!chapter) {
      req.flash("error_msg", "Chapter not found.");
      return res.redirect("/chapters");
    }

    const currentDate = new Date();
    const upcomingEvents = chapter.events.filter(event => new Date(event.eventDate) >= currentDate);
    const pastEvents = chapter.events.filter(event => new Date(event.eventDate) < currentDate);

    res.render("chapterDetails", { chapter, upcomingEvents, pastEvents });
  } catch (error) {
    console.error("Error fetching chapter details:", error);
    res.status(500).send("Server Error");
  }
});


// ✅ GET Edit Chapter Page (Only Super Admin)
router.get("/:id/edit", ensureRole("superadmin"), async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      req.flash("error_msg", "Chapter not found");
      return res.redirect("/chapters");
    }
    res.render("editChapter", { chapter });
  } catch (error) {
    console.error("Error fetching chapter for editing:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ POST Update Chapter (Only Super Admin)
router.post("/:id/edit", ensureRole("superadmin"), async (req, res) => {
  try {
    const { name, description, president, vicePresident, coordinator, teamMembers } = req.body;

    await Chapter.findByIdAndUpdate(req.params.id, {
      name,
      description,
      president,
      vicePresident,
      coordinator,
      teamMembers: teamMembers ? teamMembers.split(",") : [],
    });

    req.flash("success_msg", "Chapter updated successfully!");
    res.redirect("/chapters");
  } catch (error) {
    console.error("Error updating chapter:", error);
    req.flash("error_msg", "Something went wrong. Try again.");
    res.redirect(`/chapters/${req.params.id}/edit`);
  }
});

// ✅ DELETE Chapter (Only Super Admin)
router.post("/:id/delete", ensureRole("superadmin"), async (req, res) => {
  try {
    await Chapter.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Chapter deleted successfully!");
    res.redirect("/chapters");
  } catch (error) {
    console.error("Error deleting chapter:", error);
    req.flash("error_msg", "Something went wrong. Try again.");
    res.redirect("/chapters");
  }
});

module.exports = router;
