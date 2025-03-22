const express = require("express");
const router = express.Router();
const Chapter = require("../models/Chapter");
const Event = require("../models/Event");

// Home Page Route
router.get("/", async (req, res) => {
  try {
    const chapters = await Chapter.find({});
    const upcomingEvents = await Event.find({ eventDate: { $gte: new Date() } });

    res.render("home", { chapters, upcomingEvents });
  } catch (error) {
    console.error("Error fetching home page data:", error);
    res.status(500).send("Server Error");
  }
});


module.exports = router;
