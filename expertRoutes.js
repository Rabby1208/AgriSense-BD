
const express = require("express");
const router = express.Router();

const {
  verifyToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const expertController = require("../controllers/expertController");

const expertAdviceController = require("../controllers/expertAdviceController");

router.get("/", expertController.getPublicExperts);

router.get(
  "/profile",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertController.getMyProfile
);

router.get(
  "/farmers",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertController.getFarmers
);

router.get(
  "/farmers/:id",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertController.getFarmerDetails
);

router.get(
  "/disease-history",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertController.getDiseaseDetectionHistory
);

// Expert Advice Management
router.get(
  "/advice",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertAdviceController.getMyAdvice
);

router.post(
  "/advice",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertAdviceController.createAdvice
);

router.put(
  "/advice/:id",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertAdviceController.updateAdvice
);

router.delete(
  "/advice/:id",
  verifyToken,
  authorizeRole("AGRI_EXPERT"),
  expertAdviceController.deleteAdvice
);

module.exports = router;
