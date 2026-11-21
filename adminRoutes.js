
const express = require("express");
const router = express.Router();

const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const admin = require("../controllers/adminController");

router.use(verifyToken, authorizeRole("ADMIN"));

router.get("/profile", admin.getProfile);
router.get("/dashboard", admin.getDashboard);

router.post("/experts", admin.createExpert);
router.get("/experts", admin.getExperts);
router.put("/experts/:id", admin.updateExpert);
router.patch("/experts/:id/status", admin.updateExpertStatus);

module.exports = router;
