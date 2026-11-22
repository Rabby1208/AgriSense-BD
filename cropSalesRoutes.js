
const express = require("express");
const router = express.Router();

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

const salesController = require("../controllers/cropSalesController");

router.use(
    verifyToken,
    authorizeRole("FARMER")
);

router.get("/", salesController.getSales);

router.post("/", salesController.addSale);

router.get("/profit-loss", salesController.getProfitLoss);

module.exports = router;
