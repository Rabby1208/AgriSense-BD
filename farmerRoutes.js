
const express = require("express");
const router = express.Router();

const {
  verifyToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const farmerController = require("../controllers/farmerController");

const farmerAdviceController = require("../controllers/farmerAdviceController");

router.use(
  verifyToken,
  authorizeRole("FARMER")
);

router.get("/profile", farmerController.getProfile);

router.put("/profile", farmerController.updateProfile);

router.get("/dashboard", farmerController.getDashboard);

router.get("/crops", farmerController.getCrops);

router.post("/crops", farmerController.addCrop);

router.get("/my-crops", farmerController.getMyCrops);

router.put("/crops/:id", farmerController.updateCrop);

router.delete("/crops/:id", farmerController.deleteCrop);

// Farmer Advice
router.get(
  "/advice",
  farmerAdviceController.getMyAdvice
);

module.exports = router;
