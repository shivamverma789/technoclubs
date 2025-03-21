const express = require("express");
const { ensureRole } = require("../middleware/auth");

const router = express.Router();

// Manage Chapters
router.get("/chapters", ensureRole("superadmin"), (req, res) => {
  res.render("manageChapters");
});

// Manage Users
router.get("/users", ensureRole("superadmin"), (req, res) => {
  res.render("manageUsers");
});

module.exports = router;
