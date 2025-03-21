const express = require("express");
const { ensureAuthenticated, ensureRole } = require("../middleware/auth");

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

module.exports = router;
