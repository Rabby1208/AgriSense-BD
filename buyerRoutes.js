const express = require("express");
const router = express.Router();

const buyerController = require("../controllers/buyerController");
const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

router.post("/register", buyerController.registerBuyer);
router.post("/login", buyerController.loginBuyer);

router.get(
    "/profile",
    verifyToken,
    authorizeRole("BUYER"),
    buyerController.getBuyerProfile
);

module.exports = router;