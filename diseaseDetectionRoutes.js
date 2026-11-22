
const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  verifyToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const {
  predictDisease,
} = require("../controllers/diseaseDetectionController");

const {
  getMyDiseaseHistory,
} = require("../controllers/farmerDiseaseHistoryController");

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPG, PNG and WEBP images are allowed")
      );
    }

    callback(null, true);
  },
});

// Farmer AI disease prediction
router.post(
  "/predict",
  verifyToken,
  authorizeRole("FARMER"),
  upload.single("image"),
  predictDisease
);

// Logged-in farmer's own disease detection history
router.get(
  "/history",
  verifyToken,
  authorizeRole("FARMER"),
  getMyDiseaseHistory
);

module.exports = router;
