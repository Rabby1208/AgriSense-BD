
const express = require("express");
const router = express.Router();

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

const orderController = require("../controllers/orderController");

// ======================================
// BUYER ROUTES
// ======================================

// Buyer creates an order
router.post(
    "/",
    verifyToken,
    authorizeRole("BUYER"),
    orderController.createOrder
);

// Buyer views own orders
router.get(
    "/my-orders",
    verifyToken,
    authorizeRole("BUYER"),
    orderController.getBuyerOrders
);

// ======================================
// FARMER ROUTES
// ======================================

// Farmer views incoming orders
router.get(
    "/farmer-orders",
    verifyToken,
    authorizeRole("FARMER"),
    orderController.getFarmerOrders
);

// Farmer accepts, rejects or completes an order
router.patch(
    "/:id/status",
    verifyToken,
    authorizeRole("FARMER"),
    orderController.updateOrderStatus
);

module.exports = router;
