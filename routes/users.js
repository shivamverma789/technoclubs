const express = require("express");
const { ensureAuthenticated } = require("../middleware/auth");

const router = express.Router();

// GET User Profile
router.get("/profile", ensureAuthenticated, (req, res) => {
  res.render("profile", { user: req.user });
});

// POST Update User Profile
router.post("/profile/update", ensureAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    await User.findByIdAndUpdate(req.user._id, { name });
    req.flash("success_msg", "Profile updated.");
    res.redirect("/user/profile");
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

module.exports = router;
