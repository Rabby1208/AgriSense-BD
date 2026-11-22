
const express = require("express");
const router = express.Router();

const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const fertilizer = require("../controllers/fertilizerController");

// Public endpoints
router.get("/calculate", fertilizer.calculateFertilizer);
router.get("/crop/:cropId", fertilizer.getRecommendations);

// Admin-only endpoints
router.post(
  "/recommendations",
  verifyToken,
  authorizeRole("ADMIN"),
  fertilizer.addRecommendation
);

router.delete(
  "/recommendations/:id",
  verifyToken,
  authorizeRole("ADMIN"),
  fertilizer.deleteRecommendation
);

module.exports = router;
