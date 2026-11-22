
const express = require("express");
const router = express.Router();

const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const finance = require("../controllers/financeController");

router.use(verifyToken, authorizeRole("FARMER"));

// Farming costs
router.post("/costs", finance.addCost);
router.get("/costs", finance.getCosts);
router.put("/costs/:id", finance.updateCost);
router.delete("/costs/:id", finance.deleteCost);

// Farming revenues
router.post("/revenues", finance.addRevenue);
router.get("/revenues", finance.getRevenues);
router.put("/revenues/:id", finance.updateRevenue);
router.delete("/revenues/:id", finance.deleteRevenue);

module.exports = router;
