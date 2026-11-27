
const express = require("express");
const router = express.Router();

const {
  verifyToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const farmerDiseaseHistoryController = require("../controllers/farmerDiseaseHistoryController");

// ==========================================
// FARMER DISEASE DETECTION HISTORY
// ==========================================

router.get(
  "/",
  verifyToken,
  authorizeRole("FARMER"),
  farmerDiseaseHistoryController.getMyDiseaseHistory
);

module.exports = router;
