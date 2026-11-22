
const express = require("express");
const router = express.Router();

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

const marketplaceController = require("../controllers/marketplaceController");

// PUBLIC: Guest and Farmer can view listings
router.get("/", marketplaceController.getListings);

// PRIVATE: Farmer only
router.get(
    "/my-listings",
    verifyToken,
    authorizeRole("FARMER"),
    marketplaceController.getMyListings
);

router.post(
    "/",
    verifyToken,
    authorizeRole("FARMER"),
    marketplaceController.createListing
);

router.delete(
    "/:id",
    verifyToken,
    authorizeRole("FARMER"),
    marketplaceController.deleteListing
);

module.exports = router;
