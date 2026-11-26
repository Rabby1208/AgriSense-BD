
const express = require("express");
const router = express.Router();

const {
  verifyToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const adminExpertController = require("../controllers/adminExpertController");

router.use(verifyToken, authorizeRole("ADMIN"));

// GET all experts
router.get("/", adminExpertController.getAllExperts);

// Activate / Deactivate expert
router.patch(
  "/:id/status",
  adminExpertController.updateExpertStatus
);

// Remove expert (soft delete)
router.delete(
  "/:id",
  adminExpertController.deleteExpert
);

module.exports = router;
