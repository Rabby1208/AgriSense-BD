
const express = require("express");
const router = express.Router();

const {
  verifyToken,
  authorizeRole
} = require("../middleware/authMiddleware");

const admin = require("../controllers/adminController");

// All Admin Routes Require Admin Authentication
router.use(verifyToken, authorizeRole("ADMIN"));

// Admin Profile and Dashboard
router.get("/profile", admin.getProfile);
router.get("/dashboard", admin.getDashboard);

// Expert Management
router.post("/experts", admin.createExpert);
router.get("/experts", admin.getExperts);
router.put("/experts/:id", admin.updateExpert);
router.patch("/experts/:id/status", admin.updateExpertStatus);

// Disease Detection Management
router.get(
  "/disease-detection/stats",
  admin.getDiseaseDetectionStats
);

router.get(
  "/disease-detection/history",
  admin.getDiseaseDetectionHistory
);

module.exports = router;
