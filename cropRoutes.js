
const express = require("express");
const router = express.Router();

const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const crop = require("../controllers/cropController");

// Public crop information
router.get("/", crop.getAllCrops);
router.get("/:id", crop.getCropDetails);
router.get("/:cropId/diseases", crop.getCropDiseases);

// Admin manages disease information
router.post(
  "/diseases",
  verifyToken,
  authorizeRole("ADMIN"),
  crop.addDisease
);

router.put(
  "/diseases/:id",
  verifyToken,
  authorizeRole("ADMIN"),
  crop.updateDisease
);

router.delete(
  "/diseases/:id",
  verifyToken,
  authorizeRole("ADMIN"),
  crop.deleteDisease
);

module.exports = router;
