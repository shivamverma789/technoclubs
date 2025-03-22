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



// 🟢 POST - Create New Chapter (Super Admin Only)
router.post("/create", ensureAuthenticated, ensureRole("superadmin"), upload, async (req, res) => {
  try {
    const { name, description, president, vicePresident, coordinator, admin } = req.body;

    // ✅ Create new chapter object
    const newChapter = new Chapter({
      name,
      description,
      president,
      vicePresident,
      coordinator,
      admin,
      profileImage: req.files["profileImage"] ? req.files["profileImage"][0].filename : null, // ✅ Store image filename
    });

    await newChapter.save();
    req.flash("success_msg", "Chapter created successfully!");
    res.redirect("/chapters");
  } catch (error) {
    console.error("Error creating chapter:", error);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/chapters/create");
  }
});

module.exports = router;






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

//view chapter
router.get("/:chapterId/team", ensureAuthenticated, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId).populate("teamMembers", "name email");

    if (!chapter) {
      req.flash("error_msg", "Chapter not found.");
      return res.redirect("/chapters");
    }

    res.render("teamMembers", { chapter });
  } catch (error) {
    console.error("Error fetching team members:", error);
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
