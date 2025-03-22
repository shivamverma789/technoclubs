const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "poster") {
      cb(null, "uploads/eventPosters/"); // Folder for event posters
    } else if (file.fieldname.startsWith("speakerProfile")) {
      cb(null, "uploads/speakerProfiles/"); // Folder for speaker profiles
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only images are allowed!"));
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
}).fields([
  { name: "poster", maxCount: 1 }, // Event Poster
  { name: "speakerProfile", maxCount: 5 }, // Up to 5 speaker images
]);

module.exports = upload;
