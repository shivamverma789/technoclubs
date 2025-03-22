const express = require("express");
const { ensureAuthenticated, ensureRole } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

router.get("/admin", ensureRole("superadmin"), (req, res) => {
  res.render("adminDashboard", { user: req.user });
});

router.get("/chapter", ensureRole("chapteradmin"), (req, res) => {
  res.render("chapterDashboard", { user: req.user });
});

router.get("/user", ensureRole("user"), (req, res) => {
  res.render("userDashboard", { user: req.user });
});

// Generic Dashboard (redirects based on role)
router.get("/", ensureAuthenticated, (req, res) => {
  if (req.user.role === "superadmin") return res.redirect("/dashboard/admin");
  if (req.user.role === "chapteradmin") return res.redirect("/dashboard/chapter");
  return res.redirect("/dashboard/user");
});

router.get("/leaderboard", async (req, res) => {
    console.log("Leaderboard route accessed!"); // Debug log
    try {
      const users = await User.find().sort({ credits: -1 });
      console.log("Users fetched:", users); // Check if users are found
      res.render("leaderboard", { users });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).send("Error fetching leaderboard");
    }
  });

module.exports = router;
