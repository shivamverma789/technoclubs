const express = require("express");
const { ensureAuthenticated } = require("../middleware/auth");

const router = express.Router();

// GET Membership Application Form
router.get("/apply", ensureAuthenticated, (req, res) => {
  res.render("applyMembership");
});

// POST Membership Application
router.post("/apply", ensureAuthenticated, async (req, res) => {
  const { chapter, resume, experience } = req.body;
  // Save application to DB
  res.redirect("/dashboard/user");
});

module.exports = router;
